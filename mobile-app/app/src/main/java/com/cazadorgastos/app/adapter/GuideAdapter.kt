package com.cazadorgastos.app.adapter

import android.content.Intent
import android.net.Uri
import android.view.LayoutInflater
import android.view.ViewGroup
import android.view.animation.AnimationUtils
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import com.cazadorgastos.app.R
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
        holder.itemView.startAnimation(
            AnimationUtils.loadAnimation(holder.itemView.context, R.anim.fade_in_up)
        )
    }

    override fun getItemCount(): Int = items.size

    inner class ViewHolder(private val binding: ItemGuideBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(guide: CancellationGuide) {
            val context = binding.root.context
            binding.tvGuideServiceName.text = guide.serviceName
            binding.tvGuideTime.text = "⏱️ ~${guide.estimatedTimeMinutes} min"

            if (!guide.cancellationTrapsWarning.isNullOrEmpty()) {
                binding.layoutGuideWarningBox.visibility = android.view.View.VISIBLE
                binding.tvGuideWarning.text = guide.cancellationTrapsWarning
            } else {
                binding.layoutGuideWarningBox.visibility = android.view.View.GONE
            }

            binding.btnOpenDirectCancellation.setOnClickListener {
                try {
                    val url = guide.directCancellationUrl
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    context.startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(context, "No se pudo abrir el enlace: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
