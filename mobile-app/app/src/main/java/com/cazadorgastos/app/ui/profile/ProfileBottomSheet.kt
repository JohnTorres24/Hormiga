package com.cazadorgastos.app.ui.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.data.model.Subscription
import com.cazadorgastos.app.data.session.SessionManager
import com.cazadorgastos.app.databinding.BottomSheetProfileBinding
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

class ProfileBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetProfileBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        setupUserData()
        loadSubscriptionMetrics()

        binding.btnCloseProfile.setOnClickListener {
            dismiss()
        }
    }

    private fun setupUserData() {
        val fullName = sessionManager.getFullName()
        val email = sessionManager.getEmail()

        val initials = fullName.split(" ")
            .filter { it.isNotEmpty() }
            .take(2)
            .map { it[0].uppercaseChar() }
            .joinToString("")
            .ifEmpty { "U" }

        binding.tvProfileInitials.text = initials
        binding.tvProfileFullName.text = fullName
        binding.tvProfileEmail.text = email.ifEmpty { "cazadorgastos@organizacion.com" }
    }

    private fun formatMoney(amount: Double, currency: String): String {
        return if (currency == "USD") {
            val nf = NumberFormat.getCurrencyInstance(Locale.US)
            "${nf.format(amount)} USD"
        } else {
            val nf = NumberFormat.getCurrencyInstance(Locale("es", "CO")).apply {
                maximumFractionDigits = 0
            }
            "${nf.format(amount)} COP"
        }
    }

    private fun loadSubscriptionMetrics() {
        val currency = sessionManager.getCurrency()

        lifecycleScope.launch {
            try {
                // 1. Obtener tasa de cambio para conversiones cruzadas
                val ratesRes = RetrofitClient.apiService.getCurrencyRates()
                val dollarRate = ratesRes.data
                    ?.firstOrNull { it.baseCurrency.equals("USD", ignoreCase = true) && it.targetCurrency.equals("COP", ignoreCase = true) }
                    ?.rate ?: 3320.19

                val res = RetrofitClient.apiService.getSubscriptions()
                val allSubs = res.data ?: emptyList()

                val activeSubs = allSubs.filter { it.status.equals("active", ignoreCase = true) }
                val cancelledSubs = allSubs.filter { it.status.equals("cancelled", ignoreCase = true) }

                val activeCount = activeSubs.size
                val cancelledCount = cancelledSubs.size

                fun getConvertedCost(sub: Subscription): Double {
                    val rawCost = sub.normalizedMonthlyCost ?: sub.price
                    val subCurr = sub.currency.uppercase()
                    return if (currency == "USD") {
                        if (subCurr == "USD") rawCost else rawCost / dollarRate
                    } else {
                        if (subCurr == "COP") rawCost else rawCost * dollarRate
                    }
                }

                val activeMonthlyTotal = activeSubs.sumOf { getConvertedCost(it) }
                val cancelledMonthlySavings = cancelledSubs.sumOf { getConvertedCost(it) }
                val cancelledYearlySavings = cancelledMonthlySavings * 12

                binding.tvGhostNeutralizedBadge.text = "$cancelledCount neutralizadas"
                binding.tvTotalSavingsMonthly.text = "${formatMoney(cancelledMonthlySavings, currency)} / mes"
                binding.tvTotalSavingsYearly.text = "Ahorro anualizado protegido: ${formatMoney(cancelledYearlySavings, currency)} al año"

                binding.tvActiveCountNumber.text = activeCount.toString()
                binding.tvActiveCostDetail.text = "Gasto mensual: ${formatMoney(activeMonthlyTotal, currency)}"

                binding.tvCancelledCountNumber.text = cancelledCount.toString()

                if (cancelledSubs.isEmpty()) {
                    binding.tvCancelledSubsList.text =
                        "Aún no has cancelado ninguna suscripción. Cuando des de baja un servicio o gasto hormiga, su ahorro mensual y anual se sumará de forma permanente aquí."
                } else {
                    val sb = StringBuilder()
                    cancelledSubs.forEach { sub ->
                        val cost = getConvertedCost(sub)
                        sb.append("✅ ${sub.name} (${sub.provider}): Ahorro de ${formatMoney(cost, currency)} / mes\n")
                    }
                    binding.tvCancelledSubsList.text = sb.toString().trimEnd()
                }

            } catch (e: Exception) {
                binding.tvCancelledSubsList.text =
                    "No fue posible cargar el balance de cancelaciones: ${e.message}"
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "ProfileBottomSheet"
    }
}
