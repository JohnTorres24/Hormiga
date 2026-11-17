package com.cazadorgastos.app.data.api

import com.cazadorgastos.app.data.model.*
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.Path

interface ApiService {

    @GET("analytics/overview")
    suspend fun getOverview(): ApiResponse<AnalyticsOverview>

    @GET("subscriptions")
    suspend fun getSubscriptions(): ApiResponse<List<Subscription>>

    @GET("notifications/alerts")
    suspend fun getAlerts(): ApiResponse<List<NotificationLog>>

    @GET("cancellation-guides")
    suspend fun getGuides(): ApiResponse<List<CancellationGuide>>

    @PATCH("notifications/alerts/{id}/dismiss")
    suspend fun dismissAlert(@Path("id") id: String): ApiResponse<Map<String, Any>>
}
