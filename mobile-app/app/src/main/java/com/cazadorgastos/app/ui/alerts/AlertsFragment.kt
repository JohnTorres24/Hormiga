package com.cazadorgastos.app.ui.alerts

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.cazadorgastos.app.R
import com.cazadorgastos.app.adapter.AlertAdapter
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.databinding.FragmentAlertsBinding
import kotlinx.coroutines.launch

class AlertsFragment : Fragment() {

    private var _binding: FragmentAlertsBinding? = null
    private val binding get() = _binding!!
    private lateinit var adapter: AlertAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAlertsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = AlertAdapter { alert ->
            viewLifecycleOwner.lifecycleScope.launch {
                try {
                    RetrofitClient.apiService.dismissAlert(alert.id)
                    Toast.makeText(context, "Alerta descartada con éxito", Toast.LENGTH_SHORT).show()
                    loadAlerts()
                } catch (e: Exception) {
                    Toast.makeText(context, "Error al descartar: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.recyclerViewAlerts.layoutManager = LinearLayoutManager(context)
        binding.recyclerViewAlerts.adapter = adapter

        binding.swipeRefreshAlerts.setColorSchemeResources(R.color.amber_warning, R.color.rose_danger)
        binding.swipeRefreshAlerts.setOnRefreshListener {
            loadAlerts()
        }

        loadAlerts()
    }

    private fun loadAlerts() {
        binding.swipeRefreshAlerts.isRefreshing = true
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getAlerts()
                if (response.success && response.data != null) {
                    val list = response.data
                    adapter.submitList(list)

                    if (list.isEmpty()) {
                        binding.layoutEmptyAlerts.visibility = View.VISIBLE
                        binding.recyclerViewAlerts.visibility = View.GONE
                    } else {
                        binding.layoutEmptyAlerts.visibility = View.GONE
                        binding.recyclerViewAlerts.visibility = View.VISIBLE
                    }
                } else {
                    Toast.makeText(context, response.error ?: "Error al consultar alertas", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Error de red: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.swipeRefreshAlerts.isRefreshing = false
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
