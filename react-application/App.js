import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import AnimalsList from "./screens/AnimalsList";
import AnimalsCollection from "./screens/AnimalsCollection";

const HomeScreen = () => {
  const [selectedScreen, setSelectedScreen] = useState('');
  const [previousScreen, setPreviousScreen] = useState('');

  const handleScreenSelection = (screenName) => {
    setPreviousScreen(selectedScreen);
    setSelectedScreen(screenName);
  };

  const handleGoBack = () => {
    setSelectedScreen('');
  };

  const renderMenuButton = (screenName) => (
      <TouchableOpacity
          style={[
            styles.menuButton,
            selectedScreen === screenName && styles.selectedButton,
          ]}
          onPress={() => handleScreenSelection(screenName)}
      >
        <Text style={styles.buttonText}>{screenName}</Text>
      </TouchableOpacity>
  );

  const screens = {
    'Animals CRUD': <AnimalsList backButton={handleGoBack} />,
    'Generate Random Animal Groups': <AnimalsCollection backButton={handleGoBack} />
  }

  return (
      <View style={styles.container}>
        { selectedScreen ? ( screens[selectedScreen] ) :
         (
            <View style={styles.menuContainer}>
              {renderMenuButton('Animals CRUD')}
              {renderMenuButton('Generate Random Animal Groups')}
            </View>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  menuContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  menuButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginRight: 10,
  },
  selectedButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
});
export default function App() {
  return (
      <HomeScreen />
  );
}
// export default HomeScreen;
