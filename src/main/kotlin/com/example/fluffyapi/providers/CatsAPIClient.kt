package com.example.fluffyapi.providers

import org.springframework.beans.factory.annotation.Value
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam

@FeignClient("cats-api", url = "\${catsapi.url}")
interface CatsAPIClient {
    @GetMapping("cat")
    fun getRandomCatImage(@RequestParam json: Boolean = true): Map<String, Any>
}