import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/LoginScreen';
import SuperAdminScreen from './screens/SuperAdminScreen';
import AdminScreen from './screens/AdminScreen';
import UserScreen from './screens/UserScreen';

import { LanguageProvider } from './services/i18n';

const Stack = createStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="SuperAdmin" 
            component={SuperAdminScreen} 
            options={{ title: 'Super Admin Dashboard', headerLeft: null }} 
          />
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen} 
            options={{ title: 'Admin Dashboard', headerLeft: null }} 
          />
          <Stack.Screen 
            name="User" 
            component={UserScreen} 
            options={{ title: 'User Library', headerLeft: null }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}

