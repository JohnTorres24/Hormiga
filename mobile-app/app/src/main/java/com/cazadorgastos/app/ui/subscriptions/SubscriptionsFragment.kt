package com.cazadorgastos.app.ui.subscriptions

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.cazadorgastos.app.adapter.SubscriptionAdapter
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.databinding.FragmentSubscriptionsBinding
import kotlinx.coroutines.launch

class SubscriptionsFragment : Fragment() {

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
            if (!sub.cancellationUrl.isNullOrEmpty()) {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(sub.cancellationUrl))
                startActivity(intent)
            } else {
                Toast.makeText(context, "Abre la pestaña 'Cancelación Rápida' para ver la guía de ${sub.provider}", Toast.LENGTH_LONG).show()
            }
        }

        binding.recyclerViewSubscriptions.layoutManager = LinearLayoutManager(context)
        binding.recyclerViewSubscriptions.adapter = adapter

        binding.swipeRefresh.setOnRefreshListener {
            loadSubscriptions()
        }

        loadSubscriptions()
    }

    private fun loadSubscriptions() {
        binding.swipeRefresh.isRefreshing = true
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getSubscriptions()
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
