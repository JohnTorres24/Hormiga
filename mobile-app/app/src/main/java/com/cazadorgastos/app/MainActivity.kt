package com.cazadorgastos.app

import android.content.Intent
import android.os.Bundle
import android.view.animation.AnimationUtils
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.fragment.app.Fragment
import com.cazadorgastos.app.data.session.SessionManager
import com.cazadorgastos.app.databinding.ActivityMainBinding
import com.cazadorgastos.app.ui.alerts.AlertsFragment
import com.cazadorgastos.app.ui.dashboard.DashboardFragment
import com.cazadorgastos.app.ui.guides.GuidesFragment
import com.cazadorgastos.app.ui.subscriptions.AddSubscriptionBottomSheet
import com.cazadorgastos.app.ui.subscriptions.SubscriptionsFragment
import com.google.android.material.dialog.MaterialAlertDialogBuilder

interface CurrencyUpdatable {
    fun onCurrencyChanged(newCurrency: String)
}

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionManager: SessionManager
    private var currentFragment: Fragment? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        sessionManager = SessionManager(this)

        // Verificación de inicio de sesión
        if (!sessionManager.isLoggedIn()) {
            startActivity(Intent(this, AuthActivity::class.java))
            finish()
            return
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Manejo estricto de WindowInsets para evitar solapamiento con la barra de estado
        ViewCompat.setOnApplyWindowInsetsListener(binding.mainRootLayout) { _, insets ->
            val statusBarHeight = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
            binding.modernHeader.setPadding(
                binding.modernHeader.paddingStart,
                statusBarHeight + 12,
                binding.modernHeader.paddingEnd,
                binding.modernHeader.paddingBottom
            )
            insets
        }

        setupHeaderUI()
        setupListeners()

        // Fragment inicial
        if (savedInstanceState == null) {
            val initial = DashboardFragment()
            currentFragment = initial
            replaceFragment(initial)
        }
    }

    private fun setupHeaderUI() {
        val fullName = sessionManager.getFullName()
        val email = sessionManager.getEmail()
        val currency = sessionManager.getCurrency()

        // Iniciales para el avatar
        val initials = fullName.split(" ")
            .filter { it.isNotEmpty() }
            .take(2)
            .map { it[0].uppercaseChar() }
            .joinToString("")
            .ifEmpty { "U" }

        binding.tvUserInitials.text = initials
        binding.tvGreeting.text = "¡Hola, ${fullName.split(" ").firstOrNull() ?: "Usuario"}!"
        binding.tvUserEmail.text = email.ifEmpty { "Cazador de Gastos Hormiga" }

        updateCurrencyButtonText(currency)
    }

    private fun updateCurrencyButtonText(currency: String) {
        binding.btnToggleCurrency.text = if (currency == "USD") "💵 USD" else "💰 COP"
    }

    private fun setupListeners() {
        // Alternar moneda COP <-> USD
        binding.btnToggleCurrency.setOnClickListener {
            val anim = AnimationUtils.loadAnimation(this, R.anim.card_pop)
            binding.btnToggleCurrency.startAnimation(anim)

            val newCurrency = sessionManager.toggleCurrency()
            updateCurrencyButtonText(newCurrency)

            // Notificar al fragment activo para recálculo financiero
            (currentFragment as? CurrencyUpdatable)?.onCurrencyChanged(newCurrency)
        }

        // Cerrar sesión
        binding.btnLogout.setOnClickListener {
            MaterialAlertDialogBuilder(this)
                .setTitle("Cerrar Sesión")
                .setMessage("¿Deseas salir de tu cuenta de Cazador de Gastos Hormiga?")
                .setPositiveButton("Salir") { _, _ ->
                    sessionManager.logout()
                    startActivity(Intent(this, AuthActivity::class.java))
                    finish()
                }
                .setNegativeButton("Cancelar", null)
                .show()
        }

        // Botón FAB para registrar suscripción
        binding.fabAddSubscription.setOnClickListener {
            showAddSubscriptionDialog()
        }

        // Navegación Inferior
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            val fragment: Fragment = when (item.itemId) {
                R.id.nav_dashboard -> DashboardFragment()
                R.id.nav_subscriptions -> SubscriptionsFragment()
                R.id.nav_alerts -> AlertsFragment()
                R.id.nav_guides -> GuidesFragment()
                else -> DashboardFragment()
            }
            currentFragment = fragment
            replaceFragment(fragment)
            true
        }
    }

    private fun showAddSubscriptionDialog() {
        val bottomSheet = AddSubscriptionBottomSheet {
            // Al agregar suscripción, refrescar el fragment activo
            refreshCurrentFragment()
        }
        bottomSheet.show(supportFragmentManager, AddSubscriptionBottomSheet.TAG)
    }

    private fun refreshCurrentFragment() {
        when (val frag = currentFragment) {
            is DashboardFragment -> frag.reload()
            is SubscriptionsFragment -> frag.reload()
            else -> {
                // Si está en otra pantalla, recargar
                currentFragment?.let { replaceFragment(it) }
            }
        }
    }

    private fun replaceFragment(fragment: Fragment) {
        currentFragment = fragment
        supportFragmentManager.beginTransaction()
            .setCustomAnimations(R.anim.fade_in_up, 0)
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }
}
