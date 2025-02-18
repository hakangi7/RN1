package com.logicmaker.appleused

import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.POST
import retrofit2.http.Body

interface ApiService {

    @POST("updateFCM")
    fun updateFCM(@Body post: FcmToken): Call<FcmToken>

}