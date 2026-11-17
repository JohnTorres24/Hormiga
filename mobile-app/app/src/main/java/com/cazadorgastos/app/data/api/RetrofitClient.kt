package com.cazadorgastos.app.data.api

import android.content.Context
import com.cazadorgastos.app.BuildConfig
import com.cazadorgastos.app.data.session.SessionManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    private const val DEFAULT_CLOUD_URL = "https://cazador-gastos-hormiga-api.onrender.com/api/"
    private var sessionManager: SessionManager? = null

    fun initialize(context: Context) {
        sessionManager = SessionManager(context.applicationContext)
    }

    private val authInterceptor = Interceptor { chain ->
        val requestBuilder = chain.request().newBuilder()
        val userId = sessionManager?.getUserId() ?: "a0000000-0000-0000-0000-000000000001"
        requestBuilder.addHeader("x-user-id", userId)
        chain.proceed(requestBuilder.build())
    }

    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(logging)
        .connectTimeout(25, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .build()

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL.ifEmpty { DEFAULT_CLOUD_URL })
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
