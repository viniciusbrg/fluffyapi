package com.example.fluffyapi

import com.fasterxml.jackson.databind.ObjectMapper
import com.hubspot.jackson.datatype.protobuf.ProtobufModule
import com.innogames.springfox_protobuf.ProtobufPropertiesModule
import io.minio.MinioClient
import io.swagger.v3.core.jackson.ModelResolver
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.http.HttpMessageConverters
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.context.annotation.Bean
import org.springframework.http.converter.protobuf.ProtobufHttpMessageConverter


@SpringBootApplication
@EnableFeignClients
class FluffyAPIApplication {
    @Bean
    fun customConverters(): HttpMessageConverters? {
        val additional = ProtobufHttpMessageConverter()
        return HttpMessageConverters(additional)
    }

    @Bean
    fun objectMapper(): ObjectMapper? {
        val objectMapper = ObjectMapper()
        objectMapper.registerModule(ProtobufPropertiesModule())
        objectMapper.registerModule(ProtobufModule())
        return objectMapper
    }

    @Bean
    fun modelResolver(objectMapper: ObjectMapper?): ModelResolver? {
        return ModelResolver(objectMapper)
    }

    @Bean
    fun s3Client(@Value("\${s3.endpoint}") s3URL: String): MinioClient {
        return MinioClient.builder()
            .endpoint(s3URL)
            .credentials("minio", "miniominio")
            .build()
    }
}

fun main(args: Array<String>) {
    runApplication<FluffyAPIApplication>(*args)
}
