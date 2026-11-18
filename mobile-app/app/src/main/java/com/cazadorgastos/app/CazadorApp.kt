package com.cazadorgastos.app

import android.app.Application
import androidx.appcompat.app.AppCompatDelegate
import com.cazadorgastos.app.data.api.RetrofitClient
import com.cazadorgastos.app.data.session.SessionManager

class CazadorApp : Application() {

    override fun onCreate() {
        super.onCreate()
        val sessionManager = SessionManager(this)
        if (sessionManager.isDarkMode()) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
        }

        // Inicializar cliente HTTP Retrofit con sesión persistente
        RetrofitClient.initialize(this)
    }
}
