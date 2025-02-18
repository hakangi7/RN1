package com.logicmaker.appleused

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FromReactModule (reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FromReactModule"
    }

    @ReactMethod
    fun receiveDataFromReact(data: String) {
        // Handle the data sent from React Native
         Log.d ("com.logicmaker.appleused", "Data from React Native: $data")

        SharedPrefUtil.saveString( reactApplicationContext , "userEmail",   "$data"  )

    }
}