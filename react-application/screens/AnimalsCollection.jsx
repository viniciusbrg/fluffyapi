import React, {useEffect, useState} from 'react';
import {FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import {api} from "./api";

const AnimalsList = ({ backButton }) => {
    const [animals, setAnimals] = useState([]);
    function fetchAnimals() {
        api.getAnimalCollections().then(result => {
            setAnimals(result.data.animals)
        })
    }

    useEffect(() => {
        fetchAnimals()
    }, [])


    const renderAnimal = ({ item: animal }) => (
        <TouchableOpacity style={styles.item}>
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
                keyExtractor={item => item.imageUrl}
            />

            <TouchableOpacity style={styles.newButton} onPress={fetchAnimals}>
                <Text style={styles.buttonText}>New Pets</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addButton} onPress={backButton}>
                <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles= StyleSheet.create({
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
        width: 100,
        height: 100,
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
    newButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 8,
    },
    addButton: {
        backgroundColor: '#2196F3',
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
