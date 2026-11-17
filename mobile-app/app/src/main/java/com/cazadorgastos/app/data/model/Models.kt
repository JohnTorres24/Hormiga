package com.cazadorgastos.app.data.model

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T?,
    @SerializedName("count") val count: Int? = null,
    @SerializedName("error") val error: String? = null,
    @SerializedName("message") val message: String? = null
)

data class RegisterRequest(
    @SerializedName("fullName") val fullName: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("preferredCurrency") val preferredCurrency: String = "COP"
)

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class UserData(
    @SerializedName("id") val id: String,
    @SerializedName("fullName") val fullName: String,
    @SerializedName("email") val email: String,
    @SerializedName("preferredCurrency") val preferredCurrency: String
)

data class CreateSubscriptionRequest(
    @SerializedName("name") val name: String,
    @SerializedName("provider") val provider: String,
    @SerializedName("price") val price: Double,
    @SerializedName("currency") val currency: String,
    @SerializedName("billingCycle") val billingCycle: String,
    @SerializedName("nextBillingDate") val nextBillingDate: String,
    @SerializedName("isFreeTrial") val isFreeTrial: Boolean,
    @SerializedName("trialEndDate") val trialEndDate: String?,
    @SerializedName("usageFrequency") val usageFrequency: String,
    @SerializedName("perceivedValue") val perceivedValue: Int
)

data class Subscription(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("provider") val provider: String,
    @SerializedName("price") val price: Double,
    @SerializedName("currency") val currency: String,
    @SerializedName("billingCycle") val billingCycle: String,
    @SerializedName("nextBillingDate") val nextBillingDate: String,
    @SerializedName("isFreeTrial") val isFreeTrial: Boolean,
    @SerializedName("trialEndDate") val trialEndDate: String?,
    @SerializedName("status") val status: String,
    @SerializedName("usageFrequency") val usageFrequency: String,
    @SerializedName("perceivedValue") val perceivedValue: Int,
    @SerializedName("normalizedMonthlyCost") val normalizedMonthlyCost: Double?,
    @SerializedName("normalizedYearlyCost") val normalizedYearlyCost: Double?,
    @SerializedName("profitabilityDiagnosis") val profitabilityDiagnosis: String?,
    @SerializedName("daysUntilNextBilling") val daysUntilNextBilling: Int?,
    @SerializedName("cancellationUrl") val cancellationUrl: String?
)

data class HighestExpense(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("provider") val provider: String,
    @SerializedName("normalizedMonthlyCost") val normalizedMonthlyCost: Double,
    @SerializedName("normalizedYearlyCost") val normalizedYearlyCost: Double
)

data class AnalyticsOverview(
    @SerializedName("preferredCurrency") val preferredCurrency: String,
    @SerializedName("totalActiveSubscriptions") val totalActiveSubscriptions: Int,
    @SerializedName("activeFreeTrials") val activeFreeTrials: Int,
    @SerializedName("totalMonthlyCommitment") val totalMonthlyCommitment: Double,
    @SerializedName("totalYearlyCommitment") val totalYearlyCommitment: Double,
    @SerializedName("totalGhostExpenses") val totalGhostExpenses: Int,
    @SerializedName("potentialAnnualSavings") val potentialAnnualSavings: Double,
    @SerializedName("highestExpense") val highestExpense: HighestExpense?
)

data class NotificationLog(
    @SerializedName("id") val id: String,
    @SerializedName("subscriptionName") val subscriptionName: String,
    @SerializedName("notificationType") val notificationType: String,
    @SerializedName("scheduledFor") val scheduledFor: String,
    @SerializedName("status") val status: String,
    @SerializedName("title") val title: String,
    @SerializedName("message") val message: String
)

data class CancellationGuide(
    @SerializedName("id") val id: String,
    @SerializedName("serviceName") val serviceName: String,
    @SerializedName("providerSlug") val providerSlug: String,
    @SerializedName("directCancellationUrl") val directCancellationUrl: String,
    @SerializedName("difficultyLevel") val difficultyLevel: String,
    @SerializedName("estimatedTimeMinutes") val estimatedTimeMinutes: Int,
    @SerializedName("cancellationTrapsWarning") val cancellationTrapsWarning: String?,
    @SerializedName("instructionsJson") val instructionsJson: String?
)
