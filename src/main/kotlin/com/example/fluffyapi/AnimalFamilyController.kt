package com.example.fluffyapi

import com.example.fluffyapi.providers.CatsAPIClient
import com.example.fluffyapi.providers.DogsAPIClient
import com.example.fluffyapi.providers.DuckAPIClient
import com.github.javafaker.Faker
import io.minio.GetPresignedObjectUrlArgs
import io.minio.MinioClient
import io.minio.http.Method
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit
import kotlin.math.min
import kotlin.random.Random
import kotlin.random.nextInt

@RestController
@RequestMapping("families")
@CrossOrigin
class AnimalFamilyController(val duckAPIClient: DuckAPIClient,
                             val dogsAPIClient: DogsAPIClient,
                             val catsAPIClient: CatsAPIClient,
                             val animalsRepository: AnimalsRepository,
                             @Value("\${catsapi.url}") val catsApiUrl: String,
                             val s3Client: MinioClient, @Value("\${s3.animals-bucket}") val animalsBucket: String
    ) {

    fun getPreSignedUrl(objectId: String): String = s3Client
        .getPresignedObjectUrl(
            GetPresignedObjectUrlArgs.builder()
            .bucket(animalsBucket)
            .method(Method.GET)
            .`object`(objectId)
            .expiry(1, TimeUnit.HOURS)
            .build())

    fun animalFromUrl(url: String): AnimalDTO {
        val name = Faker.instance().funnyName().name()
        val about = Faker.instance().lorem().sentence()
        return AnimalDTO.newBuilder()
            .setName(name)
            .setAbout(about)
            .setImageUrl(url)
            .build()
    }
    fun duckFn() = animalFromUrl(duckAPIClient.getRandomDuckImage()["url"]!!)
    fun dogsFn() = animalFromUrl(dogsAPIClient.getRandomDogImage()[0])
    fun catsFn() = animalFromUrl(catsApiUrl + catsAPIClient.getRandomCatImage()["url"])
    fun localFn(): AnimalDTO{
        val allAnimals = animalsRepository
            .findAll().toList()
        if (allAnimals.isEmpty()) return duckFn()
        return allAnimals.random().toDTO(this::getPreSignedUrl)
    }

    fun generateAnimals(members: Int): ArrayList<AnimalDTO> {
        val providers = listOf(this::duckFn, this::catsFn, this::dogsFn, this::localFn)

        val animals = ArrayList<AnimalDTO>()

        for (i in 0..members) {
            val animal = providers.random().invoke()
            animals.add(animal)
        }

        return animals
    }

    @GetMapping(
        produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_PROTOBUF_VALUE]
    )
    fun getAnimalFamily(@RequestParam(defaultValue = "7") limit: Int = 7): AnimalList {
        val actualLimit = min(10, limit)

        val members = Random.nextInt(1 until actualLimit)

        return AnimalList.newBuilder().addAllAnimals(generateAnimals(members)).build()
    }
}