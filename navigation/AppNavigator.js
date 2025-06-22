// src/navigation/AppNavigator.js
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";

// TODOS OS IMPORTS ABAIXO ESTÃO AJUSTADOS
import Account from "../app_/account.js"; // Caminho ajustado
import Add from "../app_/add.js"; // Caminho ajustado
import EditExpense from "../app_/edit/[id].js"; // Caminho ajustado
import Home from "../app_/home.js"; // Caminho ajustado
import Login from "../app_/login.js"; // Caminho ajustado
import Register from "../app_/register.js"; // Caminho ajustado
import ForgotPassword from "../app_/forgotPassword.js"; // Caminho ajustado
import InitialScreen from "../app_/index.js"; // Caminho ajustado

// NOVA TELA: Ajuste o caminho aqui também
import OtherUserProfileScreen from "../app_/OtherUserProfileScreen"; // Caminho ajustado

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="MainApp">
      {/* ... (restante do código igual) ... */}
      <Stack.Screen
        name="Initial"
        component={InitialScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

      <Stack.Screen
        name="MainApp"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="Add" component={Add} />
      <Stack.Screen name="Edit" component={EditExpense} />

      <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;