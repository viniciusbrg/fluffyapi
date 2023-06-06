package com.example.fluffyapi.providers

import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@FeignClient("ducks-api", url = "\${ducksapi.url}")
interface DuckAPIClient {
    @GetMapping("quack")
    fun getRandomDuckImage(): Map<String, String>
}