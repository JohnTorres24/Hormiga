package com.cazadorgastos.app.ui.currency

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.data.model.Subscription
import com.cazadorgastos.app.databinding.BottomSheetUsdImpactBinding
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

class UsdImpactBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetUsdImpactBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetUsdImpactBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnCloseUsdImpact.setOnClickListener {
            dismiss()
        }

        loadDollarImpactData()
    }

    private fun loadDollarImpactData() {
        val copFormat = NumberFormat.getCurrencyInstance(Locale("es", "CO")).apply {
            maximumFractionDigits = 0
        }
        val usdFormat = NumberFormat.getCurrencyInstance(Locale.US)

        lifecycleScope.launch {
            try {
                // 1. Obtener tasas de cambio en vivo desde el backend
                val ratesResponse = RetrofitClient.apiService.getCurrencyRates()
                val usdCopRate = ratesResponse.data
                    ?.firstOrNull { it.baseCurrency.equals("USD", ignoreCase = true) && it.targetCurrency.equals("COP", ignoreCase = true) }
                    ?.rate ?: 4200.0

                binding.tvCurrentRate.text = "1 USD = ${copFormat.format(usdCopRate)} COP"

                // 2. Obtener suscripciones del usuario
                val subsResponse = RetrofitClient.apiService.getSubscriptions()
                val allSubs = subsResponse.data ?: emptyList()

                // Filtrar las suscripciones dolarizadas activas
                val usdSubs = allSubs.filter {
                    it.currency.equals("USD", ignoreCase = true) &&
                    it.status.equals("active", ignoreCase = true)
                }

                val totalUsdMonthly = usdSubs.sumOf { it.normalizedMonthlyCost ?: it.price }
                val totalCopEquivalent = totalUsdMonthly * usdCopRate

                binding.tvTotalUsdAmount.text = "${usdFormat.format(totalUsdMonthly)} USD / mes"
                binding.tvTotalCopEquivalent.text = "≈ ${copFormat.format(totalCopEquivalent)} COP"

                if (usdSubs.isEmpty()) {
                    binding.tvUsdSubscriptionsDetail.text =
                        "No tienes suscripciones tasadas en USD actualmente. Cualquier nuevo servicio en dólares fluctuará según la TRM diaria."
                } else {
                    val detailText = StringBuilder("Suscripciones en moneda extranjera (${usdSubs.size}):\n")
                    usdSubs.forEach { sub ->
                        val subMonthly = sub.normalizedMonthlyCost ?: sub.price
                        val inCop = subMonthly * usdCopRate
                        detailText.append("• ${sub.name}: ${usdFormat.format(subMonthly)} USD (≈ ${copFormat.format(inCop)} COP/mes)\n")
                    }
                    binding.tvUsdSubscriptionsDetail.text = detailText.toString().trimEnd()
                }

                // 3. Cálculo de Escenario Al Alza (+5%)
                val highRate = usdCopRate * 1.05
                val highMonthlyIncrease = totalUsdMonthly * (highRate - usdCopRate)
                val highYearlyIncrease = highMonthlyIncrease * 12
                binding.tvHighScenarioRate.text = "TRM: ${copFormat.format(highRate)} COP (+5%)"
                binding.tvHighScenarioImpact.text =
                    "Tus servicios dolarizados subirán +${copFormat.format(highMonthlyIncrease)} COP al mes (+${copFormat.format(highYearlyIncrease)} COP al año)."

                // 4. Cálculo de Escenario A La Baja (-5%)
                val lowRate = usdCopRate * 0.95
                val lowMonthlySavings = totalUsdMonthly * (usdCopRate - lowRate)
                val lowYearlySavings = lowMonthlySavings * 12
                binding.tvLowScenarioRate.text = "TRM: ${copFormat.format(lowRate)} COP (-5%)"
                binding.tvLowScenarioImpact.text =
                    "Ahorrarás -${copFormat.format(lowMonthlySavings)} COP al mes (-${copFormat.format(lowYearlySavings)} COP al año) en tus cobros recurrentes."

            } catch (e: Exception) {
                binding.tvUsdSubscriptionsDetail.text =
                    "No fue posible sincronizar la TRM en tiempo real: ${e.message}"
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "UsdImpactBottomSheet"
    }
}
