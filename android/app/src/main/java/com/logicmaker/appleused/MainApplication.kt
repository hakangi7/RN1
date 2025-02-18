package com.logicmaker.appleused

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import android.util.Log

class MainApplication : Application(), ReactApplication {

    companion object {
        lateinit var instance: MainApplication
            private set
    }
    private val TAG = "com.logicmaker.appleused"


    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // Add your custom package here
                    add(com.logicmaker.appleused.ReactPackage())
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override fun onCreate() {
        super.onCreate()
        instance = this
        SoLoader.init(this, false)
        Log.d(TAG , "SoLoader initialized")

        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            Log.d(TAG, "New Architecture is enabled")
            load()
        } else {
            Log.d(TAG, "application New Architecture is not enabled")
        }
    }

}
