package com.cazadorgastos.app.ui.subscriptions

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.cazadorgastos.app.CurrencyUpdatable
import com.cazadorgastos.app.R
import com.cazadorgastos.app.adapter.SubscriptionAdapter
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.data.model.Subscription
import com.cazadorgastos.app.data.session.SessionManager
import com.cazadorgastos.app.databinding.FragmentSubscriptionsBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch

class SubscriptionsFragment : Fragment(), CurrencyUpdatable {

    private var _binding: FragmentSubscriptionsBinding? = null
    private val binding get() = _binding!!
    private lateinit var adapter: SubscriptionAdapter
    private lateinit var sessionManager: SessionManager
    private var dollarRate: Double = 3320.19

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSubscriptionsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        adapter = SubscriptionAdapter { sub ->
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Dar de Baja «${sub.name}»")
                .setMessage("¿Deseas confirmar la baja de este servicio? Al cancelarlo, dejará de cobrarse y el dinero protegido se sumará de forma permanente a tu perfil de ahorro.")
                .setPositiveButton("Confirmar Cancelación") { _, _ ->
                    cancelSubscription(sub)
                }
                .setNegativeButton("Volver", null)
                .show()
        }

        val activeCurrency = sessionManager.getCurrency()
        adapter.activeCurrency = activeCurrency

        binding.recyclerViewSubscriptions.layoutManager = LinearLayoutManager(context)
        binding.recyclerViewSubscriptions.adapter = adapter

        binding.swipeRefresh.setColorSchemeResources(R.color.primary, R.color.accent)
        binding.swipeRefresh.setOnRefreshListener {
            loadSubscriptions()
        }

        loadDollarRate()
        loadSubscriptions()
    }

    private fun loadDollarRate() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val ratesRes = RetrofitClient.apiService.getCurrencyRates()
                val rate = ratesRes.data
                    ?.firstOrNull { it.baseCurrency.equals("USD", ignoreCase = true) && it.targetCurrency.equals("COP", ignoreCase = true) }
                    ?.rate
                if (rate != null && rate > 0) {
                    dollarRate = rate
                    adapter.dollarRate = rate
                }
            } catch (_: Exception) {}
        }
    }

    override fun onCurrencyChanged(newCurrency: String) {
        adapter.updateCurrency(newCurrency, dollarRate)
        loadSubscriptions()
    }

    fun reload() {
        loadSubscriptions()
    }

    private fun cancelSubscription(sub: Subscription) {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = RetrofitClient.apiService.updateSubscriptionStatus(
                    sub.id,
                    mapOf("status" to "cancelled")
                )
                if (res.success) {
                    Toast.makeText(
                        requireContext(),
                        "¡«${sub.name}» dada de baja! Se ha sumado a tus ahorros en el perfil.",
                        Toast.LENGTH_SHORT
                    ).show()
                    loadSubscriptions()
                } else {
                    Toast.makeText(
                        requireContext(),
                        res.error ?: "Error al cancelar la suscripción",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    requireContext(),
                    "Error de conexión: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun loadSubscriptions() {
        binding.swipeRefresh.isRefreshing = true
        val activeCurrency = sessionManager.getCurrency()
        adapter.updateCurrency(activeCurrency, dollarRate)

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getSubscriptions("active")
                if (response.success && response.data != null) {
                    val list = response.data
                    adapter.submitList(list)

                    binding.tvSubCountBadge.text = "${list.size} activas ($activeCurrency)"

                    if (list.isEmpty()) {
                        binding.layoutEmptySubscriptions.visibility = View.VISIBLE
                        binding.recyclerViewSubscriptions.visibility = View.GONE
                    } else {
                        binding.layoutEmptySubscriptions.visibility = View.GONE
                        binding.recyclerViewSubscriptions.visibility = View.VISIBLE
                    }
                } else {
                    Toast.makeText(context, response.error ?: "Error al cargar suscripciones", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Error de red: ${e.message}", Toast.LENGTH_SHORT).show()
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
