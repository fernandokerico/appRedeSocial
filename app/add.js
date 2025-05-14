import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useRouter } from 'expo-router';

export default function AddExpense() {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const router = useRouter();
  const user = auth.currentUser;

  const handleAdd = async () => {
    if (!description || !value || !date) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      const expenseData = {
        description,
        value: parseFloat(value),
        date: new Date(date),
      };

      await addDoc(collection(db, 'users', user.uid, 'expenses'), expenseData);
      router.replace('/home');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o gasto.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Descrição:</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Valor:</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Data (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="Ex: 2025-05-13"
      />

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Adicionar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
