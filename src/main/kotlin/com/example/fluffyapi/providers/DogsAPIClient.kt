package com.example.fluffyapi.providers

import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam

@FeignClient("dogs-api", url = "\${dogsapi.url}")
interface DogsAPIClient {
    @GetMapping("shibes")
    fun getRandomDogImage(@RequestParam count: Int = 1,
                          @RequestParam urls: Boolean = true,
                          @RequestParam httpsUrls: Boolean = true): List<String>
}