package com.cazadorgastos.app.data.session

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREF_NAME = "cazador_gastos_session"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_FULL_NAME = "full_name"
        private const val KEY_EMAIL = "email"
        private const val KEY_CURRENCY = "preferred_currency"
        private const val KEY_DARK_MODE = "is_dark_mode"
    }

    fun saveUser(userId: String, fullName: String, email: String, currency: String = "COP") {
        prefs.edit().apply {
            putBoolean(KEY_IS_LOGGED_IN, true)
            putString(KEY_USER_ID, userId)
            putString(KEY_FULL_NAME, fullName)
            putString(KEY_EMAIL, email)
            putString(KEY_CURRENCY, currency)
            apply()
        }
    }

    fun isLoggedIn(): Boolean = prefs.getBoolean(KEY_IS_LOGGED_IN, false)

    fun getUserId(): String = prefs.getString(KEY_USER_ID, "a0000000-0000-0000-0000-000000000001") ?: "a0000000-0000-0000-0000-000000000001"

    fun getFullName(): String = prefs.getString(KEY_FULL_NAME, "Usuario") ?: "Usuario"

    fun getEmail(): String = prefs.getString(KEY_EMAIL, "usuario@cazadorgastos.com") ?: ""

    fun getCurrency(): String = prefs.getString(KEY_CURRENCY, "COP") ?: "COP"

    fun toggleCurrency(): String {
        val next = if (getCurrency() == "COP") "USD" else "COP"
        prefs.edit().putString(KEY_CURRENCY, next).apply()
        return next
    }

    fun isDarkMode(): Boolean = prefs.getBoolean(KEY_DARK_MODE, false)

    fun setDarkMode(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_DARK_MODE, enabled).apply()
    }

    fun logout() {
        prefs.edit().clear().apply()
    }
}
