package com.logicmaker.appleused
import android.content.Context
import android.content.SharedPreferences

object SharedPrefUtil {
    private const val PREF_NAME = "AppleUsed"

    private fun getPreferences(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    }

    // Save a String value
    fun saveString(context: Context, key: String, value: String) {
        val editor = getPreferences(context).edit()
        editor.putString(key, value)
        editor.apply()
    }

    // Get a String value
    fun getString(context: Context, key: String, defaultValue: String = ""): String {
        return getPreferences(context).getString(key, defaultValue) ?: defaultValue
    }

    // Save an Int value
    fun saveInt(context: Context, key: String, value: Int) {
        val editor = getPreferences(context).edit()
        editor.putInt(key, value)
        editor.apply()
    }

    // Get an Int value
    fun getInt(context: Context, key: String, defaultValue: Int = 0): Int {
        return getPreferences(context).getInt(key, defaultValue)
    }

    // Save a Boolean value
    fun saveBoolean(context: Context, key: String, value: Boolean) {
        val editor = getPreferences(context).edit()
        editor.putBoolean(key, value)
        editor.apply()
    }

    // Get a Boolean value
    fun getBoolean(context: Context, key: String, defaultValue: Boolean = false): Boolean {
        return getPreferences(context).getBoolean(key, defaultValue)
    }

    // Clear all preferences
    fun clearAll(context: Context) {
        val editor = getPreferences(context).edit()
        editor.clear()
        editor.apply()
    }
}
