package com.cazadorgastos.app.data.api

import com.cazadorgastos.app.data.model.*
import retrofit2.http.*

interface ApiService {

    // Autenticación
    @POST("auth/register")
    suspend fun register(@Body req: RegisterRequest): ApiResponse<UserData>

    @POST("auth/login")
    suspend fun login(@Body req: LoginRequest): ApiResponse<UserData>

    // Analítica y Resumen (Soporta parámetro currency)
    @GET("analytics/overview")
    suspend fun getOverview(
        @Query("currency") currency: String? = null
    ): ApiResponse<AnalyticsOverview>

    // Suscripciones
    @GET("subscriptions")
    suspend fun getSubscriptions(): ApiResponse<List<Subscription>>

    @POST("subscriptions")
    suspend fun createSubscription(
        @Body req: CreateSubscriptionRequest
    ): ApiResponse<Map<String, Any>>

    // Alertas 48h
    @GET("notifications/alerts")
    suspend fun getAlerts(): ApiResponse<List<NotificationLog>>

    @PATCH("notifications/alerts/{id}/dismiss")
    suspend fun dismissAlert(@Path("id") id: String): ApiResponse<Map<String, Any>>

    // Guías de Cancelación Rápida
    @GET("cancellation-guides")
    suspend fun getGuides(): ApiResponse<List<CancellationGuide>>
}
