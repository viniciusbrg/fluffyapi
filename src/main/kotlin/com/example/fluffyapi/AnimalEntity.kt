package com.example.fluffyapi

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.validation.constraints.NotBlank

@Entity
@Table(name = "animals")
class AnimalEntity(
    @field:NotBlank val name: String,
    @field:NotBlank val about: String,
    @field:NotBlank val imageObjectId: String,
    @field:Id @field:GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long? = null,
) {
    fun toDTO(idToUrl: (String) -> String): AnimalDTO = AnimalDTO
        .newBuilder()
        .setName(name)
        .setAbout(about)
        .setImageUrl(idToUrl(imageObjectId))
        .setId(id as Long)
        .build()

    companion object {
        fun fromDTO(animalDTO: AnimalDTO, id: Long? = null): AnimalEntity {
            return AnimalEntity(animalDTO.name, animalDTO.about, animalDTO.imageUrl, id)
        }
    }
}