package com.cazadorgastos.app.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.cazadorgastos.app.data.model.Subscription
import com.cazadorgastos.app.databinding.ItemSubscriptionBinding
import java.text.NumberFormat
import java.util.Locale

class SubscriptionAdapter(
    private val onCancelClicked: (Subscription) -> Unit
) : RecyclerView.Adapter<SubscriptionAdapter.ViewHolder>() {

    private val items = mutableListOf<Subscription>()
    private val nf = NumberFormat.getCurrencyInstance(Locale("es", "CO"))

    fun submitList(newItems: List<Subscription>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemSubscriptionBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class ViewHolder(private val binding: ItemSubscriptionBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(sub: Subscription) {
            binding.tvSubName.text = sub.name
            binding.tvSubProvider.text = "${sub.provider} • Ciclo ${sub.billingCycle}"
            binding.tvSubPrice.text = "${sub.currency} ${sub.price.toInt()}"

            val days = sub.daysUntilNextBilling
            if (days != null) {
                binding.tvDaysRemaining.text = when {
                    days <= 0 -> "¡Cobro HOY!"
                    days == 1 -> "En 24h (48h alerta)"
                    else -> "En $days días"
                }
            }

            binding.tvDiagnosisBadge.text = when (sub.profitabilityDiagnosis) {
                "critico_gasto_hormiga" -> "⚠️ Gasto Hormiga Crítico"
                "alta_rentabilidad" -> "⭐ Alta Rentabilidad"
                else -> "Rentabilidad Moderada"
            }

            binding.btnQuickCancel.setOnClickListener {
                onCancelClicked(sub)
            }
        }
    }
}
