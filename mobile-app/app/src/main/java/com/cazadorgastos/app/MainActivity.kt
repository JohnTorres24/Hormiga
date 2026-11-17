package com.cazadorgastos.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.cazadorgastos.app.databinding.ActivityMainBinding
import com.cazadorgastos.app.ui.alerts.AlertsFragment
import com.cazadorgastos.app.ui.dashboard.DashboardFragment
import com.cazadorgastos.app.ui.guides.GuidesFragment
import com.cazadorgastos.app.ui.subscriptions.SubscriptionsFragment

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Fragment inicial: Dashboard
        if (savedInstanceState == null) {
            replaceFragment(DashboardFragment())
        }

        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_dashboard -> {
                    replaceFragment(DashboardFragment())
                    true
                }
                R.id.nav_subscriptions -> {
                    replaceFragment(SubscriptionsFragment())
                    true
                }
                R.id.nav_alerts -> {
                    replaceFragment(AlertsFragment())
                    true
                }
                R.id.nav_guides -> {
                    replaceFragment(GuidesFragment())
                    true
                }
                else -> false
            }
        }
    }

    private fun replaceFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }
}
