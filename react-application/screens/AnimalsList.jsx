import React, {useEffect, useState} from 'react';
import {FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import {api} from "./api";

const AnimalsList = ({ backButton }) => {
    const [animals, setAnimals] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedAnimalName, setEditedAnimalName] = useState('');
    const [editedAnimalDescription, setEditedAnimalDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    async function getImageBlob(url) {
        const imageRaw = await fetch(url);
        return await imageRaw.blob()
    }

    const isAddAnimal = selectedAnimal => Object.keys(selectedAnimal || {}).length === 0

    function fetchAnimals() {
        api.getAnimals().then(result => {
            setAnimals(result.data.animals)
        })
    }

    useEffect(() => {
        fetchAnimals()
    }, [])
    const handleAddItem = () => {
       openEditModal({})
    };

    const handleSaveItem = async () => {
        if (selectedImage) {
            const uploadMetadata = await api.getPresignedUploadInfo()
            const uploadUrl = uploadMetadata.data.s3UploadUrl
            const objectId = uploadMetadata.data.objectId
            const s3Metadata = uploadMetadata.data.s3Properties
            const formData = new FormData();

            s3Metadata.forEach(el => {
                formData.append(el.key, el.value)
            })

            formData.append('key', objectId)
            formData.append('image', selectedImage.blob, objectId);
            formData.append('Content-Type', 'image/jpeg')

            // Make the HTTP request to upload the image
            try {
                const response = await axios.post(uploadUrl, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (isAddAnimal(selectedAnimal)) {
                    await api.addAnimal({
                        name: editedAnimalName, about: editedAnimalDescription, imageUrl: objectId })
                } else {
                    await api.updateAnimal(selectedAnimal.id, {
                        name: editedAnimalName, about: editedAnimalDescription, imageUrl: objectId })
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            } finally {
                await fetchAnimals()
            }
        }

        setIsModalOpen(false);
    };

    const openEditModal = async (item) => {
        setSelectedAnimal(item);
        setEditedAnimalName(item.name);
        setEditedAnimalDescription(item.about);

        if (isAddAnimal(item)) {
            setSelectedImage(null)
        } else {
            const imageBlob = await getImageBlob(item.imageUrl)
            setSelectedImage( { uri: item.imageUrl, blob: imageBlob })
        }

        setIsModalOpen(true);
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.cancelled) {
                const imageBlob = await getImageBlob(result.uri)
                setSelectedImage({ blob: imageBlob, uri: result.uri } );
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const renderAnimal = ({ item: animal }) => (
        <TouchableOpacity style={styles.item} onPress={() => openEditModal(animal)}>
            <Image source={{ uri: animal.imageUrl }} style={styles.thumbnail} />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{animal.name}</Text>
                <Text style={styles.itemDescription}>{animal.about}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={animals}
                renderItem={renderAnimal}
                keyExtractor={item => item.id.toString()}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                <Text style={styles.buttonText}>Add New Animal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={backButton}>
                <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>

            <Modal visible={isModalOpen} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isAddAnimal(selectedAnimal) ? "Add Item" : "Edit Item"}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Item Name"
                            value={editedAnimalName}
                            onChangeText={text => setEditedAnimalName(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Item Description"
                            value={editedAnimalDescription}
                            onChangeText={text => setEditedAnimalDescription(text)}
                        />
                        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                            <Text style={styles.buttonText}>Pick Image</Text>
                        </TouchableOpacity>
                        {selectedImage && (
                            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                        )}
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalOpen(false)}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 10,
    },
    item: {
        flexDirection: 'row',
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        borderRadius: 8,
    },
    thumbnail: {
        width: 50,
        height: 50,
        marginRight: 10,
        borderRadius: 4,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemDescription: {
        marginTop: 5,
        fontSize: 14,
        color: '#888888',
    },
    addButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    backButton: {
        backgroundColor: '#2196F3',
        margin: 10,
        padding: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 8,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    saveButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    closeButton: {
        backgroundColor: '#888888',
        padding: 10,
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    imagePickerButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    selectedImage: {
        width: 200,
        height: 200,
        marginTop: 10,
        resizeMode: 'cover',
        borderRadius: 8,
    },
});
export default AnimalsList;
