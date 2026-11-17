package com.cazadorgastos.app.ui.guides

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.cazadorgastos.app.adapter.GuideAdapter
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.databinding.FragmentGuidesBinding
import kotlinx.coroutines.launch

class GuidesFragment : Fragment() {

    private var _binding: FragmentGuidesBinding? = null
    private val binding get() = _binding!!
    private lateinit var adapter: GuideAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentGuidesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = GuideAdapter()
        binding.recyclerViewGuides.layoutManager = LinearLayoutManager(context)
        binding.recyclerViewGuides.adapter = adapter

        loadGuides()
    }

    private fun loadGuides() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getGuides()
                if (response.success && response.data != null) {
                    adapter.submitList(response.data)
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
