package com.logicmaker.appleused

data class Post(
    val id: Int,
    val title: String,
    val body: String

)

data class FcmToken(

    val email: String,
    val token: String

)
