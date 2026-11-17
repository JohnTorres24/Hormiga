package com.cazadorgastos.app

import android.app.Application
import com.cazadorgastos.app.data.api.RetrofitClient

class CazadorApp : Application() {

    override fun onCreate() {
        super.onCreate()
        // Inicializar cliente HTTP Retrofit con sesión persistente
        RetrofitClient.initialize(this)
    }
}
