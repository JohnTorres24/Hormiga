package com.cazadorgastos.app

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.data.model.LoginRequest
import com.cazadorgastos.app.data.model.RegisterRequest
import com.cazadorgastos.app.data.session.SessionManager
import com.cazadorgastos.app.databinding.ActivityAuthBinding
import kotlinx.coroutines.launch

class AuthActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAuthBinding
    private lateinit var sessionManager: SessionManager
    private var isRegisterMode = false
    private var selectedCurrency = "COP"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sessionManager = SessionManager(this)

        if (sessionManager.isLoggedIn()) {
            goToMainActivity()
            return
        }

        binding = ActivityAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnTabLogin.setOnClickListener {
            if (isRegisterMode) {
                setRegisterMode(false)
            }
        }

        binding.btnTabRegister.setOnClickListener {
            if (!isRegisterMode) {
                setRegisterMode(true)
            }
        }

        binding.toggleCurrency.check(R.id.btnCOP)
        binding.toggleCurrency.addOnButtonCheckedListener { _, checkedId, isChecked ->
            if (isChecked) {
                selectedCurrency = if (checkedId == R.id.btnCOP) "COP" else "USD"
            }
        }

        binding.btnSubmitAuth.setOnClickListener {
            if (isRegisterMode) {
                handleRegister()
            } else {
                handleLogin()
            }
        }
    }

    private fun setRegisterMode(register: Boolean) {
        isRegisterMode = register

        if (register) {
            binding.tilFullName.visibility = View.VISIBLE
            binding.layoutCurrencySelection.visibility = View.VISIBLE
            binding.btnSubmitAuth.text = "Crear Cuenta"

            binding.btnTabRegister.setTextColor(getColor(R.color.surface_white))
            binding.btnTabRegister.setBackgroundColor(getColor(R.color.primary))
            binding.btnTabLogin.setTextColor(getColor(R.color.text_secondary))
            binding.btnTabLogin.setBackgroundColor(getColor(android.R.color.transparent))
        } else {
            binding.tilFullName.visibility = View.GONE
            binding.layoutCurrencySelection.visibility = View.GONE
            binding.btnSubmitAuth.text = "Iniciar Sesión"

            binding.btnTabLogin.setTextColor(getColor(R.color.surface_white))
            binding.btnTabLogin.setBackgroundColor(getColor(R.color.primary))
            binding.btnTabRegister.setTextColor(getColor(R.color.text_secondary))
            binding.btnTabRegister.setBackgroundColor(getColor(android.R.color.transparent))
        }
    }

    private fun handleLogin() {
        val email = binding.etEmail.text?.toString()?.trim() ?: ""
        val password = binding.etPassword.text?.toString() ?: ""

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Por favor completa tu correo y contraseña", Toast.LENGTH_SHORT).show()
            return
        }

        setLoading(true)
        lifecycleScope.launch {
            try {
                val res = RetrofitClient.apiService.login(LoginRequest(email, password))
                if (res.success && res.data != null) {
                    val user = res.data
                    sessionManager.saveUser(user.id, user.fullName, user.email, user.preferredCurrency)
                    Toast.makeText(this@AuthActivity, "¡Bienvenido, ${user.fullName}!", Toast.LENGTH_SHORT).show()
                    goToMainActivity()
                } else {
                    Toast.makeText(this@AuthActivity, res.error ?: "Error al iniciar sesión", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@AuthActivity, "Error de conexión: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                setLoading(false)
            }
        }
    }

    private fun handleRegister() {
        val fullName = binding.etFullName.text?.toString()?.trim() ?: ""
        val email = binding.etEmail.text?.toString()?.trim() ?: ""
        val password = binding.etPassword.text?.toString() ?: ""

        if (fullName.isEmpty() || email.isEmpty() || password.length < 6) {
            Toast.makeText(this, "Completa todos los campos (contraseña mínimo 6 caracteres)", Toast.LENGTH_LONG).show()
            return
        }

        setLoading(true)
        lifecycleScope.launch {
            try {
                val res = RetrofitClient.apiService.register(
                    RegisterRequest(fullName, email, password, selectedCurrency)
                )
                if (res.success && res.data != null) {
                    val user = res.data
                    sessionManager.saveUser(user.id, user.fullName, user.email, user.preferredCurrency)
                    Toast.makeText(this@AuthActivity, "Cuenta creada exitosamente para $email", Toast.LENGTH_SHORT).show()
                    goToMainActivity()
                } else {
                    Toast.makeText(this@AuthActivity, res.error ?: "Error al registrar la cuenta", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@AuthActivity, "Error de conexión: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                setLoading(false)
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        binding.progressBarAuth.visibility = if (loading) View.VISIBLE else View.GONE
        binding.btnSubmitAuth.isEnabled = !loading
    }

    private fun goToMainActivity() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
