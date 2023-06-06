package com.example.fluffyapi

import com.example.fluffyapi.providers.S3Client
import io.minio.MinioClient
import io.minio.PostPolicy
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.http.MediaType.*
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import java.time.ZonedDateTime
import java.util.UUID

@RestController
@CrossOrigin
class AnimalImagesController(@Value("\${s3.endpoint}") private val s3URL: String,
                             @Value("\${s3.animals-bucket}") val animalsBucket: String, val s3Client: MinioClient) {

    @GetMapping("animals/upload-url",
        produces = [APPLICATION_JSON_VALUE, APPLICATION_XML_VALUE, APPLICATION_PROTOBUF_VALUE]
    )
    fun getPreSignedAnimalImageUrl(): PreSignedAnimalUpload {
        val objectId = UUID.randomUUID().toString() + ".jpeg"
        val policy = PostPolicy(animalsBucket, ZonedDateTime.now().plusHours(1))

        policy.addEqualsCondition("key", objectId)

        val s3UploadFields = s3Client.getPresignedPostFormData(policy)
        return PreSignedAnimalUpload.newBuilder()
            .setObjectId(objectId)
            .setS3UploadUrl("${s3URL}/${animalsBucket}")
            .putAllS3Properties(s3UploadFields)
            .build()
    }
}