import axios from 'axios';

const apiUrl = process.env.API_URL

const instance = axios.create({
    baseURL: "http://192.168.0.33:8080",
});
function getAnimals() {
    return instance.get("animals")
}

function addAnimal(animal) {
    return instance.post("animals", animal)
}

function updateAnimal(id, animal) {

    return instance.put(`animals/${id}`, animal)
}

function getPreSignedUploadInfo() {
    return instance.get('animals/upload-url')
}

function getAnimalCollections() {
    return instance.get('families')
}

export const api = {
    getAnimals, addAnimal, updateAnimal, getPresignedUploadInfo: getPreSignedUploadInfo, getAnimalCollections
}