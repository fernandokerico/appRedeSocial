import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPassword from "../app_/forgotPassword.js";
import Login from "../app_/login.js";
import Register from "../app_/register.js";
// A linha 'import Index' foi removida pois a tela Index não será usada.

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* Removido completamente o bloco da tela Index para evitar o erro de espaço/caractere */}
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default AuthNavigator;