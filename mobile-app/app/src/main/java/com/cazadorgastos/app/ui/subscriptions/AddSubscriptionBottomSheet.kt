package com.cazadorgastos.app.ui.subscriptions

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.cazadorgastos.app.R
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.data.model.CreateSubscriptionRequest
import com.cazadorgastos.app.data.session.SessionManager
import com.cazadorgastos.app.databinding.BottomSheetAddSubscriptionBinding
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class AddSubscriptionBottomSheet(
    private val onSubscriptionCreated: () -> Unit
) : BottomSheetDialogFragment() {

    private var _binding: BottomSheetAddSubscriptionBinding? = null
    private val binding get() = _binding!!

    private var selectedCurrency = "COP"
    private var selectedNextBillingDate: String = ""
    private var selectedTrialEndDate: String? = null
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val displayFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetAddSubscriptionBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val sessionManager = SessionManager(requireContext())
        selectedCurrency = sessionManager.getCurrency()

        // Sincronizar moneda por defecto
        if (selectedCurrency == "USD") {
            binding.toggleSubCurrency.check(R.id.btnSubUSD)
        } else {
            binding.toggleSubCurrency.check(R.id.btnSubCOP)
        }

        binding.toggleSubCurrency.addOnButtonCheckedListener { _, checkedId, isChecked ->
            if (isChecked) {
                selectedCurrency = if (checkedId == R.id.btnSubUSD) "USD" else "COP"
            }
        }

        // Fecha de cobro por defecto: en 30 días
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_MONTH, 30)
        selectedNextBillingDate = dateFormat.format(cal.time)
        binding.btnPickNextBillingDate.text = "Próximo cobro: ${displayFormat.format(cal.time)}"

        binding.btnPickNextBillingDate.setOnClickListener {
            val c = Calendar.getInstance()
            val datePickerDialog = DatePickerDialog(
                requireContext(),
                { _, year, month, dayOfMonth ->
                    c.set(year, month, dayOfMonth)
                    selectedNextBillingDate = dateFormat.format(c.time)
                    binding.btnPickNextBillingDate.text = "Próximo cobro: ${displayFormat.format(c.time)}"
                },
                c.get(Calendar.YEAR),
                c.get(Calendar.MONTH),
                c.get(Calendar.DAY_OF_MONTH)
            )
            // Impedir selección de fechas anteriores al día actual
            datePickerDialog.datePicker.minDate = System.currentTimeMillis()
            datePickerDialog.show()
        }

        // Control de prueba gratuita
        binding.cbIsFreeTrial.setOnCheckedChangeListener { _, isChecked ->
            binding.btnPickTrialEndDate.visibility = if (isChecked) View.VISIBLE else View.GONE
            if (isChecked && selectedTrialEndDate == null) {
                val trialCal = Calendar.getInstance()
                trialCal.add(Calendar.DAY_OF_MONTH, 7)
                selectedTrialEndDate = dateFormat.format(trialCal.time)
                binding.btnPickTrialEndDate.text = "Fin de prueba: ${displayFormat.format(trialCal.time)}"
            }
        }

        binding.btnPickTrialEndDate.setOnClickListener {
            val c = Calendar.getInstance()
            val datePickerDialog = DatePickerDialog(
                requireContext(),
                { _, year, month, dayOfMonth ->
                    c.set(year, month, dayOfMonth)
                    selectedTrialEndDate = dateFormat.format(c.time)
                    binding.btnPickTrialEndDate.text = "Fin de prueba: ${displayFormat.format(c.time)}"
                },
                c.get(Calendar.YEAR),
                c.get(Calendar.MONTH),
                c.get(Calendar.DAY_OF_MONTH)
            )
            // Impedir selección de fechas anteriores al día actual
            datePickerDialog.datePicker.minDate = System.currentTimeMillis()
            datePickerDialog.show()
        }

        // Slider de calificación de utilidad
        binding.sliderPerceivedValue.addOnChangeListener { _, value, _ ->
            val rating = value.toInt()
            val text = when (rating) {
                1 -> "Utilidad: 1★ (Candidato a Gasto Hormiga)"
                2 -> "Utilidad: 2★ (Uso ocasional)"
                3 -> "Utilidad: 3★ (Uso moderado)"
                4 -> "Utilidad: 4★ (Muy útil)"
                5 -> "Utilidad: 5★ (Indispensable)"
                else -> "Utilidad: $rating★"
            }
            binding.tvRatingLabel.text = text
        }

        // Botón Guardar
        binding.btnSaveSubscription.setOnClickListener {
            saveSubscription()
        }
    }

    private fun saveSubscription() {
        val name = binding.etSubName.text?.toString()?.trim() ?: ""
        val provider = binding.etSubProvider.text?.toString()?.trim().let {
            if (it.isNullOrEmpty()) name else it
        }
        val priceStr = binding.etSubPrice.text?.toString()?.trim() ?: ""

        if (name.isEmpty()) {
            binding.etSubName.error = "Escribe el nombre del servicio"
            return
        }

        val price = priceStr.toDoubleOrNull()
        if (price == null || price <= 0) {
            binding.etSubPrice.error = "Ingresa un precio válido"
            return
        }

        val billingCycle = when (binding.rgBillingCycle.checkedRadioButtonId) {
            R.id.rbYearly -> "yearly"
            R.id.rbWeekly -> "weekly"
            else -> "monthly"
        }

        val isFreeTrial = binding.cbIsFreeTrial.isChecked
        val perceivedValue = binding.sliderPerceivedValue.value.toInt()
        val usageFrequency = when (perceivedValue) {
            1 -> "rarely"
            2 -> "monthly"
            3 -> "weekly"
            else -> "daily"
        }

        // Validación estricta: impedir fechas anteriores al día actual
        val today = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        try {
            val billingCal = Calendar.getInstance().apply {
                val parsed = dateFormat.parse(selectedNextBillingDate)
                if (parsed != null) time = parsed
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            if (billingCal.before(today)) {
                Toast.makeText(requireContext(), "La fecha de cobro no puede ser anterior al día actual.", Toast.LENGTH_LONG).show()
                return
            }
        } catch (_: Exception) {}

        if (isFreeTrial && selectedTrialEndDate != null) {
            try {
                val trialCal = Calendar.getInstance().apply {
                    val parsed = dateFormat.parse(selectedTrialEndDate!!)
                    if (parsed != null) time = parsed
                    set(Calendar.HOUR_OF_DAY, 0)
                    set(Calendar.MINUTE, 0)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                }
                if (trialCal.before(today)) {
                    Toast.makeText(requireContext(), "La fecha de fin de prueba no puede ser anterior al día actual.", Toast.LENGTH_LONG).show()
                    return
                }
            } catch (_: Exception) {}
        }

        val req = CreateSubscriptionRequest(
            name = name,
            provider = provider,
            price = price,
            currency = selectedCurrency,
            billingCycle = billingCycle,
            nextBillingDate = selectedNextBillingDate,
            isFreeTrial = isFreeTrial,
            trialEndDate = if (isFreeTrial) selectedTrialEndDate else null,
            usageFrequency = usageFrequency,
            perceivedValue = perceivedValue
        )

        binding.btnSaveSubscription.isEnabled = false
        binding.btnSaveSubscription.text = "Guardando..."

        lifecycleScope.launch {
            try {
                val res = RetrofitClient.apiService.createSubscription(req)
                if (res.success) {
                    Toast.makeText(
                        requireContext(),
                        "¡Suscripción «$name» guardada con éxito!",
                        Toast.LENGTH_SHORT
                    ).show()
                    onSubscriptionCreated()
                    dismiss()
                } else {
                    Toast.makeText(
                        requireContext(),
                        res.error ?: "No fue posible guardar la suscripción.",
                        Toast.LENGTH_LONG
                    ).show()
                    binding.btnSaveSubscription.isEnabled = true
                    binding.btnSaveSubscription.text = "Guardar Suscripción"
                }
            } catch (e: Exception) {
                Toast.makeText(
                    requireContext(),
                    "Error de conexión con el servidor: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
                binding.btnSaveSubscription.isEnabled = true
                binding.btnSaveSubscription.text = "Guardar Suscripción"
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "AddSubscriptionBottomSheet"
    }
}
