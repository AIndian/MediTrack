import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStore } from './src/state/AppStore';
import { AppStoreProvider } from './src/state/AppStoreContext';
import { seedIfEmpty } from './src/state/sampleData';
import TodayScreen from './src/screens/TodayScreen';
import DoseScreen from './src/screens/DoseScreen';
import MedicineDetailsScreen from './src/screens/MedicineDetailsScreen';
import ComingSoonScreen from './src/screens/ComingSoonScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Today" component={TodayScreen} />
      <Stack.Screen name="Dose" component={DoseScreen} />
      <Stack.Screen name="MedicineDetails" component={MedicineDetailsScreen} />
      {/* Placeholders: teammates replace these with the real screens */}
      <Stack.Screen name="MedicineForm" component={ComingSoonScreen} initialParams={{ title: 'Add medicine' }} />
      <Stack.Screen name="History" component={ComingSoonScreen} initialParams={{ title: 'Dose history' }} />
      <Stack.Screen name="Symptoms" component={ComingSoonScreen} initialParams={{ title: 'Symptoms' }} />
      <Stack.Screen name="Summary" component={ComingSoonScreen} initialParams={{ title: 'Appointment summary' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    AppStore.load(AsyncStorage).then((loaded) => {
      if (__DEV__) seedIfEmpty(loaded); // demo data in development only
      setStore(loaded);
    });
  }, []);

  if (!store) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator accessibilityLabel="Loading" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppStoreProvider store={store}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}