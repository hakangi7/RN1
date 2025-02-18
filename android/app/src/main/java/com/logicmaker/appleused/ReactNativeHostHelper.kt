package com.logicmaker.appleused

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.ReactApplicationContext

object ReactNativeHostHelper {

    /**
     * Retrieve the ReactNativeHost from the application context.
     */
    fun getReactNativeHost(application: Application): ReactNativeHost {
        return (application as ReactApplication).reactNativeHost
    }

    /**
     * Retrieve the ReactApplicationContext from the ReactNativeHost.
     * Returns null if the React context is not yet initialized.
     */
    fun getReactApplicationContext(): ReactApplicationContext? {
        val host = getReactNativeHost( MainApplication.instance)
        return host.reactInstanceManager.currentReactContext as? ReactApplicationContext
    }
}
