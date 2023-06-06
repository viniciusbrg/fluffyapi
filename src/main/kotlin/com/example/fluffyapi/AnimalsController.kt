package com.example.fluffyapi

import io.minio.GetPresignedObjectUrlArgs
import io.minio.MinioClient
import io.minio.http.Method
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.Validator
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType.*
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.concurrent.TimeUnit


@RestController("animals")
@RequestMapping("animals")
@CrossOrigin
class AnimalsController(val animalsRepository: AnimalsRepository,
                        val validator: Validator,
                        val s3Client: MinioClient, @Value("\${s3.animals-bucket}") val animalsBucket: String ) {

    fun getPreSignedUrl(objectId: String): String = s3Client
        .getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
            .bucket(animalsBucket)
            .method(Method.GET)
            .`object`(objectId)
            .expiry(1, TimeUnit.HOURS)
            .build())

    @GetMapping(
        produces = [APPLICATION_JSON_VALUE, APPLICATION_XML_VALUE, APPLICATION_PROTOBUF_VALUE]
    )
    fun list(): AnimalList {
        val animals = animalsRepository
            .findAll()
            .map { animalEntity -> animalEntity.toDTO(this::getPreSignedUrl) };
        return AnimalList.newBuilder().addAllAnimals(animals).build()
    }

    @PostMapping(
        consumes = [APPLICATION_JSON_VALUE, APPLICATION_XML_VALUE, APPLICATION_PROTOBUF_VALUE],
        produces = [APPLICATION_JSON_VALUE, APPLICATION_XML_VALUE, APPLICATION_PROTOBUF_VALUE]
    )
    @ApiResponses(value = [
        ApiResponse(responseCode = "201", description = "Created"),
        ApiResponse(responseCode = "400", description = "Bad request")
        ]
    )
    fun add(@RequestBody animal: AnimalDTO): ResponseEntity<AnimalDTO> {
        val entity = AnimalEntity.fromDTO(animal)

        val isValid = validator.validate(entity).isEmpty()

        return if (isValid) ResponseEntity.status(201).body(animalsRepository.save(entity).toDTO(this::getPreSignedUrl))
        else ResponseEntity.badRequest().build()
    }

    @PutMapping(
        "{id}",
        consumes = [APPLICATION_JSON_VALUE, APPLICATION_XML_VALUE, APPLICATION_PROTOBUF_VALUE],
        produces = [APPLICATION_JSON_VALUE, APPLICATION_XML_VALUE, APPLICATION_PROTOBUF_VALUE]
    )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Updated"),
        ApiResponse(responseCode = "400", description = "Invalid request"),
        ApiResponse(responseCode = "404", description = "Id not found")
    ]
    )
    fun edit(@RequestBody animal: AnimalDTO, @PathVariable id: Long): ResponseEntity<AnimalDTO> {
        val entity = AnimalEntity.fromDTO(animal, id)
        val isInvalidRequest = validator.validate(entity).isNotEmpty()

        if (isInvalidRequest) return ResponseEntity.badRequest().build()

        val idIsMissing = animalsRepository.findById(id).isEmpty

        if (idIsMissing) return ResponseEntity.notFound().build()

        return ResponseEntity.status(200).body(animalsRepository.save(entity).toDTO(this::getPreSignedUrl))
    }

    @DeleteMapping(
        "{id}",
        produces = [APPLICATION_JSON_VALUE, APPLICATION_XML_VALUE, APPLICATION_PROTOBUF_VALUE]
    )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Deleted"),
        ApiResponse(responseCode = "404", description = "Id not found")
    ]
    )
    fun delete(@PathVariable id: Long): ResponseEntity<AnimalDTO> {
        val entity = animalsRepository.findById(id)

        if (entity.isEmpty) return ResponseEntity.notFound().build()

        animalsRepository.deleteById(id)
        return ResponseEntity.ok(entity.get().toDTO(this::getPreSignedUrl))
    }
}