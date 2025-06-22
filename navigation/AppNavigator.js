// AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator"; // Importa o TabNavigator
import OtherUserProfileScreen from '../app_/OtherUserProfileScreen'; // <-- IMPORTANTE: Importe esta tela

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="MainApp">
      {/* A tela principal da aplicação para usuários logados, que é o TabNavigator */}
      <Stack.Screen
        name="MainApp" // Nome da tela que contém as abas
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Adicione outras telas que SÓ usuários logados podem acessar aqui,
          se elas não fizerem parte das abas. Exemplo:
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      */}
      {/* <-- Adicione esta linha para a tela de perfil de outros usuários */}
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} options={{ headerShown: false }} /> 
    </Stack.Navigator>
  );
}

export default AppNavigator;