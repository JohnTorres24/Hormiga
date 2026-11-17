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
import com.cazadorgastos.app.databinding.FragmentSubscriptionsBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch

class SubscriptionsFragment : Fragment(), CurrencyUpdatable {

    private var _binding: FragmentSubscriptionsBinding? = null
    private val binding get() = _binding!!
    private lateinit var adapter: SubscriptionAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSubscriptionsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = SubscriptionAdapter { sub ->
            // Si no tiene enlace directo, mostrar diálogo de guía
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Cancelar ${sub.name}")
                .setMessage("Esta suscripción no tiene un enlace de cancelación configurado. Puedes revisar la sección de Guías de Cancelación en el menú inferior para seguir los pasos.")
                .setPositiveButton("Entendido", null)
                .show()
        }

        binding.recyclerViewSubscriptions.layoutManager = LinearLayoutManager(context)
        binding.recyclerViewSubscriptions.adapter = adapter

        binding.swipeRefresh.setColorSchemeResources(R.color.primary, R.color.accent)
        binding.swipeRefresh.setOnRefreshListener {
            loadSubscriptions()
        }

        loadSubscriptions()
    }

    override fun onCurrencyChanged(newCurrency: String) {
        loadSubscriptions()
    }

    fun reload() {
        loadSubscriptions()
    }

    private fun loadSubscriptions() {
        binding.swipeRefresh.isRefreshing = true
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getSubscriptions()
                if (response.success && response.data != null) {
                    val list = response.data
                    adapter.submitList(list)

                    binding.tvSubCountBadge.text = "${list.size} activas"

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
