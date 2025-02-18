package com.logicmaker.appleused

import android.content.pm.PackageManager
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.Manifest
import android.content.Context
import android.content.Intent
import android.os.DeadObjectException
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.Toast
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.messaging.FirebaseMessaging

import androidx.lifecycle.lifecycleScope
import com.facebook.react.ReactInstanceManager
import com.th3rdwave.safeareacontext.getReactContext
import kotlinx.coroutines.launch
import org.json.JSONObject


class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "RN1"
    private  val MAX_RETRIES = 5
    private val REQUEST_CODE = 100
    private val TAG = "com.logicmaker.appleused"
    private  var context : Context? = null
    lateinit var  reactInstanceManager2: ReactInstanceManager
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        context = this.context
        // Request permissions if not already granted
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED  ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
            ) {

            ActivityCompat.requestPermissions(this,
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.CAMERA,
                    Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE,
                    Manifest.permission.READ_MEDIA_IMAGES ,
                    Manifest.permission.POST_NOTIFICATIONS
                ), REQUEST_CODE
            )
        }

        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {

            ActivityCompat.requestPermissions(this,
                arrayOf(
                   Manifest.permission.POST_NOTIFICATIONS
                ), REQUEST_CODE
            )

        } else {
            // Permission already granted
            FirebaseMessaging.getInstance().token.addOnCompleteListener(OnCompleteListener { task ->
                if (!task.isSuccessful) {
                    Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                    return@OnCompleteListener
                }

                // Get new FCM registration token
                val token = task.result

                // Log and toast
                val msg = getString(R.string.msg_token_fmt, token)
                Log.d(TAG, msg)
                //Toast.makeText(baseContext, msg, Toast.LENGTH_SHORT).show()

                lifecycleScope.launch {
                    try {
                        val email = context?.let { SharedPrefUtil.getString(  it ,"userEmail" ) }
                        val newToken = email?.let { FcmToken(  email = it, token =  token ) }
                        val posts = newToken?.let { RetrofitClient.apiService.updateFCM(it) }

                        Log.d(TAG , "Retrofit Posts: $posts")
                    } catch (e: Exception) {
                        Log.e(TAG , "Retrofit Error: ${e.message}")
                    }
                }



            })



        }

        Log.d(TAG , "onCreate called with intent: ${intent?.extras}")

        val data: Map<String, String> = intent?.extras?.let { bundle ->
            bundle.keySet().associateWith { key ->
                val value = bundle.get(key)
                when (value) {
                    is String -> value // If the value is a String, return it directly
                    is Int -> value.toString() // Convert Integer to String
                    is Long -> value.toString() // Convert Long to String
                    else -> "" // Provide a default for unsupported types
                }
            }
        } ?: emptyMap()

        val application = MainApplication.instance
        val reactNativeHost = application.reactNativeHost
         reactInstanceManager2 = reactNativeHost.reactInstanceManager

   Log.d(TAG, "main ac called " );

            if ( data.size > 0 && !isFinishing && !isDestroyed &&  reactInstanceManager2.hasStartedCreatingInitialContext()) {
                Log.e(TAG, "main ac called 1" );
        Handler(Looper.getMainLooper()).postDelayed({
            try {
                val retryReactContext = reactInstanceManager2.currentReactContext
                if (retryReactContext != null) {
                    val dataJson = JSONObject(data).toString(4)
                    Log.e(TAG, "main ac called 2  $dataJson " );
                    val module = retryReactContext.getNativeModule(RNEventEmitterModule::class.java)
                    module?.sendEvent("FCMMessageReceived", data)
                } else {
                    Log.e(TAG, "ReactContext still not ready")
                }
            } catch (e: DeadObjectException) {
                Log.e(TAG, "DeadObjectException occurred: ${e.message}")
                // Handle the exception or clean up resources
            }
        }, 1000) // Retry after 1 second
        } else {
            Log.d(TAG, "ReactContext not ready, retrying...")
            retryWithExponentialBackoff(0, data);
        }


    }


    private fun retryWithExponentialBackoff(retries: Int, data: Map<String, String>) {
        val retryDelay = (2000 * Math.pow(2.0, retries.toDouble())).toLong()
        if (retries > MAX_RETRIES) {
            Log.d(TAG, "Max retries reached. Giving up.")
            return
        }

        Handler(Looper.getMainLooper()).postDelayed({
            val retryReactContext = reactInstanceManager2.currentReactContext
            if (retryReactContext != null) {
                Log.d(TAG, "ReactContext ready after retry")
                val module = retryReactContext.getNativeModule(RNEventEmitterModule::class.java)
                module?.sendEvent("FCMMessageReceived", data)
            } else {
                Log.d(TAG, "ReactContext still not ready; retrying...")
                retryWithExponentialBackoff(retries + 1, data)
            }
        }, retryDelay)
    }

    override fun onNewIntent(intent: Intent?) {
        Log.d(TAG , "main noti  onNewIntent ");
        super.onNewIntent(intent)

    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE) {
            // Handle the permission result here if needed
            for (i in permissions.indices) {
                if (grantResults[i] == PackageManager.PERMISSION_GRANTED) {
                    // Permission granted
                } else {
                    // Permission denied
                }
            }
        }
    }


  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
