package com.logicmaker.appleused

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = RNEventEmitterModule.NAME)
class RNEventEmitterModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var listenerCount = 0

    companion object {
        const val NAME = "RNEventEmitter" // The name of the module exposed to JavaScript
    }

    override fun getName(): String {
        return "RNEventEmitter"
    }

    // Send event to React Native
    fun sendEvent(eventName: String, data: Any?) {
        val reactContext = reactApplicationContext
        if (reactContext.hasActiveCatalystInstance()) {
            val params = Arguments.createMap()

            // Convert ArrayMap to WritableMap if necessary
            if (data is Map<*, *>) {
                for ((key, value) in data) {
                    when (value) {
                        is String -> params.putString(key as String, value)
                        is Int -> params.putInt(key as String, value)
                        is Boolean -> params.putBoolean(key as String, value)
                        is Double -> params.putDouble(key as String, value)
                        is Float -> params.putDouble(key as String, value.toDouble())
                        //is Map<*, *> -> params.putMap(key as String, Arguments.makeNativeMap(value))
                        is List<*> -> params.putArray(key as String, Arguments.makeNativeArray(value))
                        else -> params.putString(key as String, value?.toString())
                    }
                }
            }

            // Emit the event to React Native
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    // Implement addListener for NativeEventEmitter compatibility
    @ReactMethod
    fun addListener(eventName: String) {
        listenerCount += 1
        // No additional implementation needed
    }

    // Implement removeListeners for NativeEventEmitter compatibility
    @ReactMethod
    fun removeListeners(count: Int) {
        listenerCount -= count
        // No additional implementation needed
    }

    @ReactMethod
    fun fcmEmit() {
        sendEvent("FCMMessageReceived", mapOf("message" to "Test FCM Message"))
    }
}
