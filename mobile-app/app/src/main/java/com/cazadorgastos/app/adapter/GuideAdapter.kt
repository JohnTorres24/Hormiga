package com.cazadorgastos.app.adapter

import android.content.Intent
import android.net.Uri
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.cazadorgastos.app.data.model.CancellationGuide
import com.cazadorgastos.app.databinding.ItemGuideBinding

class GuideAdapter : RecyclerView.Adapter<GuideAdapter.ViewHolder>() {

    private val items = mutableListOf<CancellationGuide>()

    fun submitList(newItems: List<CancellationGuide>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemGuideBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class ViewHolder(private val binding: ItemGuideBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(guide: CancellationGuide) {
            binding.tvGuideServiceName.text = guide.serviceName
            binding.tvGuideTime.text = "~${guide.estimatedTimeMinutes} min"

            if (!guide.cancellationTrapsWarning.isNullOrEmpty()) {
                binding.tvGuideWarning.visibility = android.view.View.VISIBLE
                binding.tvGuideWarning.text = "⚠️ " + guide.cancellationTrapsWarning
            } else {
                binding.tvGuideWarning.visibility = android.view.View.GONE
            }

            binding.btnOpenDirectCancellation.setOnClickListener {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(guide.directCancellationUrl))
                it.context.startActivity(intent)
            }
        }
    }
}
