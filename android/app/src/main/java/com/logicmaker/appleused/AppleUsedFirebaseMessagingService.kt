package com.logicmaker.appleused


import android.Manifest
import android.app.ActivityManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class AppleUsedFirebaseMessagingService : FirebaseMessagingService() {

    val TAG = "com.logicmaker.appleused"
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Handle FCM messages here.
        Log.d(TAG , "From: ${remoteMessage.toString() }")

        // Check if message contains a notification payload.
        remoteMessage.notification?.let {
            Log.d(TAG, "Message Notification Title: ${it.title}")
            Log.d(TAG , "Message Notification Body: ${it.body}")
           // showNotification(it.title, it.body)
        }

        // Check if message contains a data payload.
        remoteMessage.data.isNotEmpty().let {

            val title = remoteMessage.data["title"] ?: "Default Title" // Extract title from data
            val body = remoteMessage.data["body"] ?: "Default Body"   // Extract body from data


            if (!isAppInForeground()) {
                showNotification( title,  body ,remoteMessage.data )
            }

            Log.d(TAG , "Message Data Payload: ${remoteMessage.data}")
            // Handle data payload if needed
            val reactContext = ReactNativeHostHelper.getReactApplicationContext()

            if (reactContext != null) {
                val module = reactContext.getNativeModule(RNEventEmitterModule::class.java)
                module?.sendEvent("FCMMessageReceived", remoteMessage.data )
            }
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG , "Refreshed token: $token")

        // Send token to server if needed
    }

    private fun showNotification(title: String?, message: String?, data: Map<String, String>) {
        val channelId = "FCM_channel"
        val notificationId = 101

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "FCM Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Channel for FCM notifications"
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }

        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            data.forEach { (key, value) ->
                putExtra(key, value) // Pass custom data to the activity
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )


        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon( R.mipmap.ic_launcher ) // Replace with your app's notification icon
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true) // Dismiss notification when touched
            .setContentIntent(pendingIntent)

        with(NotificationManagerCompat.from(this@AppleUsedFirebaseMessagingService)) {
            if (ActivityCompat.checkSelfPermission(
                    this@AppleUsedFirebaseMessagingService,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {

                Log.d(TAG, "noti deny")
                return
            }
            notify(notificationId, notificationBuilder.build())
        }
    }
    private fun isAppInForeground(): Boolean {
        val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val appProcesses = activityManager.runningAppProcesses ?: return false

        for (process in appProcesses) {
            if (process.processName == packageName) {
                return process.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
            }
        }
        return false
    }
}
