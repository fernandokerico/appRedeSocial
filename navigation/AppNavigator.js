import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator"; 
import OtherUserProfileScreen from '../app_/OtherUserProfileScreen';
import CommentScreen from '../app_/CommentScreen'; 

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="MainApp">
      {}
      <Stack.Screen
        name="MainApp" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      {}
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} options={{ headerShown: false }} /> 
      
      {}
      <Stack.Screen 
        name="CommentScreen" 
        component={CommentScreen} 
        options={{ title: 'Comentários' }} 
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;