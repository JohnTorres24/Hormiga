package com.cazadorgastos.app

import android.app.Application
import androidx.appcompat.app.AppCompatDelegate
import com.cazadorgastos.app.data.api.RetrofitClient

class CazadorApp : Application() {

    override fun onCreate() {
        super.onCreate()
        // Forzar modo claro de alto contraste para que el texto siempre sea negro profundo sobre superficies claras
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)

        // Inicializar cliente HTTP Retrofit con sesión persistente
        RetrofitClient.initialize(this)
    }
}
