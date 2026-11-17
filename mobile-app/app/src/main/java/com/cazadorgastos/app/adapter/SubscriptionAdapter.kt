package com.cazadorgastos.app.adapter

import android.content.Intent
import android.net.Uri
import android.view.LayoutInflater
import android.view.ViewGroup
import android.view.animation.AnimationUtils
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.cazadorgastos.app.R
import com.cazadorgastos.app.data.model.Subscription
import com.cazadorgastos.app.databinding.ItemSubscriptionBinding
import java.text.NumberFormat
import java.util.Locale

class SubscriptionAdapter(
    private val onCancelClicked: (Subscription) -> Unit
) : RecyclerView.Adapter<SubscriptionAdapter.ViewHolder>() {

    private val items = mutableListOf<Subscription>()

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
        // Animación suave de entrada
        holder.itemView.startAnimation(
            AnimationUtils.loadAnimation(holder.itemView.context, R.anim.fade_in_up)
        )
    }

    override fun getItemCount(): Int = items.size

    inner class ViewHolder(private val binding: ItemSubscriptionBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(sub: Subscription) {
            val context = binding.root.context
            binding.tvSubName.text = sub.name

            val cycleEs = when (sub.billingCycle.lowercase()) {
                "yearly" -> "Anual"
                "weekly" -> "Semanal"
                else -> "Mensual"
            }
            binding.tvSubProvider.text = "${sub.provider} • $cycleEs"

            // Formato de precio
            val formattedPrice = if (sub.currency.equals("USD", ignoreCase = true)) {
                val nf = NumberFormat.getCurrencyInstance(Locale.US)
                "${nf.format(sub.price)} USD"
            } else {
                val nf = NumberFormat.getCurrencyInstance(Locale("es", "CO"))
                nf.maximumFractionDigits = 0
                "${nf.format(sub.price)} COP"
            }
            binding.tvSubPrice.text = formattedPrice

            // Días restantes o alerta
            val days = sub.daysUntilNextBilling
            if (days != null) {
                binding.tvDaysRemaining.text = when {
                    days < 0 -> "Cobro vencido"
                    days == 0 -> "¡Cobro HOY!"
                    days == 1 -> "¡Cobro mañana! (Alerta 48h)"
                    days == 2 -> "En 2 días (Alerta 48h)"
                    else -> "En $days días"
                }

                if (days <= 2) {
                    binding.tvDaysRemaining.setTextColor(
                        ContextCompat.getColor(context, R.color.rose_danger)
                    )
                } else {
                    binding.tvDaysRemaining.setTextColor(
                        ContextCompat.getColor(context, R.color.amber_warning)
                    )
                }
            }

            // Diagnóstico de rentabilidad Cazador de Gastos Hormiga
            when (sub.profitabilityDiagnosis) {
                "critico_gasto_hormiga" -> {
                    binding.tvDiagnosisBadge.text = "⚠️ Gasto Hormiga Crítico"
                    binding.tvDiagnosisBadge.setBackgroundResource(R.drawable.bg_tag_danger)
                    binding.tvDiagnosisBadge.setTextColor(
                        ContextCompat.getColor(context, R.color.rose_danger)
                    )
                }
                "alta_rentabilidad" -> {
                    binding.tvDiagnosisBadge.text = "⭐ Alta Rentabilidad"
                    binding.tvDiagnosisBadge.setBackgroundResource(R.drawable.bg_tag_success)
                    binding.tvDiagnosisBadge.setTextColor(
                        ContextCompat.getColor(context, R.color.emerald_dark)
                    )
                }
                else -> {
                    binding.tvDiagnosisBadge.text = "Uso Moderado"
                    binding.tvDiagnosisBadge.setBackgroundResource(R.drawable.bg_tag_warning)
                    binding.tvDiagnosisBadge.setTextColor(
                        ContextCompat.getColor(context, R.color.amber_dark)
                    )
                }
            }

            // Botón de cancelación
            binding.btnQuickCancel.setOnClickListener {
                if (!sub.cancellationUrl.isNullOrEmpty()) {
                    try {
                        val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(sub.cancellationUrl))
                        context.startActivity(browserIntent)
                    } catch (e: Exception) {
                        Toast.makeText(context, "URL de cancelación no válida: ${sub.cancellationUrl}", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    onCancelClicked(sub)
                }
            }
        }
    }
}
