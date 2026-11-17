package com.cazadorgastos.app.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.databinding.FragmentDashboardBinding
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!
    private val nf = NumberFormat.getCurrencyInstance(Locale("es", "CO"))

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.swipeRefresh.setOnRefreshListener {
            loadDashboardData()
        }

        loadDashboardData()
    }

    private fun loadDashboardData() {
        binding.swipeRefresh.isRefreshing = true
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getOverview()
                if (response.success && response.data != null) {
                    val data = response.data
                    binding.tvMonthlyTotal.text = "${nf.format(data.totalMonthlyCommitment)} ${data.preferredCurrency}"
                    binding.tvActiveCount.text = "${data.totalActiveSubscriptions} suscripciones activas (${data.activeFreeTrials} pruebas gratuitas)"

                    binding.tvYearlyTotal.text = "${nf.format(data.totalYearlyCommitment)} ${data.preferredCurrency}"
                    binding.tvAnnualImpactPhrase.text = "«Tus ${data.totalActiveSubscriptions} suscripciones te cuestan ${nf.format(data.totalYearlyCommitment)} al año»"

                    binding.tvPotentialSavings.text = "${nf.format(data.potentialAnnualSavings)} ${data.preferredCurrency}"
                    binding.tvGhostCount.text = "${data.totalGhostExpenses} gastos hormiga detectados con uso casi nulo"

                    if (data.highestExpense != null) {
                        binding.tvHighestName.text = data.highestExpense.name
                        binding.tvHighestAmount.text = "${nf.format(data.highestExpense.normalizedMonthlyCost)} / mes"
                    } else {
                        binding.tvHighestName.text = "Sin registros"
                        binding.tvHighestAmount.text = "$0"
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Error al conectar con el servidor: ${e.message}", Toast.LENGTH_SHORT).show()
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
