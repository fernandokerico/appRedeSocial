import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Página Inicial homejs </Text>
      <Button title="Ir para Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
