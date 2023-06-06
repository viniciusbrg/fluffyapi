package com.example.fluffyapi

import org.springframework.data.repository.CrudRepository

interface AnimalsRepository : CrudRepository<AnimalEntity, Long> {
}