package com.cazadorgastos.app.ui.alerts

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
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
                    Toast.makeText(context, "Alerta descartada", Toast.LENGTH_SHORT).show()
                    loadAlerts()
                } catch (e: Exception) {
                    Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.recyclerViewAlerts.layoutManager = LinearLayoutManager(context)
        binding.recyclerViewAlerts.adapter = adapter

        binding.swipeRefresh.setOnRefreshListener {
            loadAlerts()
        }

        loadAlerts()
    }

    private fun loadAlerts() {
        binding.swipeRefresh.isRefreshing = true
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getAlerts()
                if (response.success && response.data != null) {
                    adapter.submitList(response.data)
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
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
