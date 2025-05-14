import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig'; // caminho corrigido
import { useLocalSearchParams, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';

export default function EditExpense() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const docRef = doc(db, 'users', user.uid, 'expenses', id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setDescription(data.description || '');
            setValue(data.value?.toString() || '');
            const dateObj = data.date?.toDate?.();
            setDate(dateObj ? dateObj.toISOString().split('T')[0] : '');
          } else {
            Alert.alert('Erro', 'Gasto não encontrado.');
            router.replace('/');
          }
        } catch (error) {
          Alert.alert('Erro', 'Não foi possível carregar o gasto.');
          console.error(error);
        }
        setLoading(false);
      } else {
        router.replace('/login'); 
      }
    });

    return () => unsubscribe();
  }, [id]);

  const handleUpdate = async () => {
    if (!description || !value || !date) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid, 'expenses', id);
      await updateDoc(docRef, {
        description,
        value: parseFloat(value),
        date: new Date(date),
      });

      router.replace('/home');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o gasto.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

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

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
