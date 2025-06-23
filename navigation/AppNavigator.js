// AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator"; // Importa o TabNavigator
import OtherUserProfileScreen from '../app_/OtherUserProfileScreen'; // Importe esta tela
import CommentScreen from '../app_/CommentScreen'; // <--- NOVO: Importe CommentScreen
                                                   // ATENÇÃO: Ajuste este caminho se CommentScreen.js não estiver em `../app_`

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
          se elas não fizerem parte das abas.
      */}
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} options={{ headerShown: false }} /> 
      
      {/* <--- NOVO: Adicione esta linha para a tela de Comentários --- > */}
      <Stack.Screen 
        name="CommentScreen" 
        component={CommentScreen} 
        options={{ title: 'Comentários' }} // Você pode definir o título do cabeçalho aqui
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;