import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Account from "../app_/account.js";
import Add from "../app_/add.js";
import EditExpense from "../app_/edit/[id].js";
import Home from "../app_/home.js";
import Login from "../app_/login.js";
import Register from "../app_/register.js";
import ForgotPassword from "../app_/forgotPassword.js";
import InitialScreen from "../app_/index.js"; 

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Initial"> 
      <Stack.Screen
        name="Initial"
        component={InitialScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Home" component={Home} /> 
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="Add" component={Add} />
      <Stack.Screen name="Edit" component={EditExpense} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
