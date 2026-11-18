package com.cazadorgastos.app.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.AnimationUtils
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.cazadorgastos.app.CurrencyUpdatable
import com.cazadorgastos.app.R
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.data.session.SessionManager
import com.cazadorgastos.app.databinding.FragmentDashboardBinding
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

class DashboardFragment : Fragment(), CurrencyUpdatable {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        binding.swipeRefresh.setColorSchemeResources(R.color.primary, R.color.accent)
        binding.swipeRefresh.setOnRefreshListener {
            loadDashboardData()
        }

        binding.tvLiveRateBadge.setOnClickListener {
            com.cazadorgastos.app.ui.currency.UsdImpactBottomSheet().show(
                parentFragmentManager,
                com.cazadorgastos.app.ui.currency.UsdImpactBottomSheet.TAG
            )
        }

        loadDashboardData()
    }

    override fun onCurrencyChanged(newCurrency: String) {
        // Al alternar la divisa desde el header
        loadDashboardData()
    }

    fun reload() {
        loadDashboardData()
    }

    private fun formatMoney(amount: Double, currency: String): String {
        return if (currency == "USD") {
            val nf = NumberFormat.getCurrencyInstance(Locale.US)
            "${nf.format(amount)} USD"
        } else {
            val nf = NumberFormat.getCurrencyInstance(Locale("es", "CO"))
            nf.maximumFractionDigits = 0
            "${nf.format(amount)} COP"
        }
    }

    private fun loadDashboardData() {
        binding.swipeRefresh.isRefreshing = true
        val activeCurrency = sessionManager.getCurrency()

        binding.tvActiveCurrencyTag.text = "Moneda: $activeCurrency"

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getOverview(currency = activeCurrency)
                if (response.success && response.data != null) {
                    val data = response.data
                    val curr = data.preferredCurrency

                    binding.tvMonthlyTotal.text = formatMoney(data.totalMonthlyCommitment, curr)
                    binding.tvActiveCount.text = "${data.totalActiveSubscriptions} suscripciones activas (${data.activeFreeTrials} pruebas gratuitas)"

                    binding.tvYearlyTotal.text = formatMoney(data.totalYearlyCommitment, curr)
                    binding.tvAnnualImpactPhrase.text = "«Tus ${data.totalActiveSubscriptions} suscripciones te cuestan ${formatMoney(data.totalYearlyCommitment, curr)} al año»"

                    binding.tvPotentialSavings.text = formatMoney(data.potentialAnnualSavings, curr)
                    binding.tvGhostCount.text = "${data.totalGhostExpenses} gastos hormiga detectados con uso casi nulo o pruebas por vencer"

                    if (data.highestExpense != null) {
                        binding.tvHighestName.text = data.highestExpense.name
                        binding.tvHighestAmount.text = "${formatMoney(data.highestExpense.normalizedMonthlyCost, curr)} / mes"
                    } else {
                        binding.tvHighestName.text = "Sin registros activos"
                        binding.tvHighestAmount.text = formatMoney(0.0, curr)
                    }

                    // Animación suave de entrada para el contenedor
                    val anim = AnimationUtils.loadAnimation(requireContext(), R.anim.fade_in_up)
                    binding.dashboardContentContainer.startAnimation(anim)

                } else {
                    Toast.makeText(context, response.error ?: "Error al obtener datos", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Error al conectar con la nube: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.swipeRefresh.isRefreshing = false
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
