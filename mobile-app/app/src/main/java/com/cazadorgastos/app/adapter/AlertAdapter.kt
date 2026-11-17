package com.cazadorgastos.app.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.cazadorgastos.app.data.model.NotificationLog
import com.cazadorgastos.app.databinding.ItemAlertBinding

class AlertAdapter(
    private val onDismissClicked: (NotificationLog) -> Unit
) : RecyclerView.Adapter<AlertAdapter.ViewHolder>() {

    private val items = mutableListOf<NotificationLog>()

    fun submitList(newItems: List<NotificationLog>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemAlertBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class ViewHolder(private val binding: ItemAlertBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(alert: NotificationLog) {
            binding.tvAlertTitle.text = alert.title
            binding.tvAlertMessage.text = alert.message
            binding.btnDismissAlert.setOnClickListener {
                onDismissClicked(alert)
            }
        }
    }
}
