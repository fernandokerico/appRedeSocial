import React from 'react'; // <--- Adicionado aqui
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator"; // Importa o TabNavigator

// NOTA: As telas de autenticação (Login, Register, ForgotPassword)
// foram REMOVIDAS daqui, pois elas já são gerenciadas pelo AuthNavigator.
// Este AppNavigator é APENAS para usuários LOGADOS.

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
    </Stack.Navigator>
  );
}

export default AppNavigator;