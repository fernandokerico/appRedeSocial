// src/navigation/AppNavigator.js
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator"; // Importa o TabNavigator

// TODOS OS IMPORTS ABAIXO ESTÃO AJUSTADOS
import Home from "../app_/home.js"; // Caminho ajustado
import Login from "../app_/login.js"; // Caminho ajustado
import Register from "../app_/register.js"; // Caminho ajustado
import ForgotPassword from "../app_/forgotPassword.js"; // Caminho ajustado

// NOVA TELA: Ajuste o caminho aqui também
import OtherUserProfileScreen from "../app_/OtherUserProfileScreen"; // Caminho ajustado

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="MainApp">
      {/* As telas de autenticação */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

      {/* A tela principal da aplicação, que é o TabNavigator */}
      <Stack.Screen
        name="MainApp"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* Outras telas que podem ser acessadas fora do TabNavigator ou com navegação stack */}
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;