import { useState } from 'react';
import { TextInput, Button, View, Text, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!regexPassword.test(password)) {
      setErrorMessage('A senha deve conter no mínimo 8 caracteres, letra maiúscula, minúscula, número e símbolo');
      return;
    }

    try {
      // Criação do usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verifique se o UID do usuário foi criado corretamente
      if (!user || !user.uid) {
        setErrorMessage('Erro ao criar o usuário. Tente novamente.');
        return;
      }

      // Tente adicionar dados do usuário à coleção "users"
      try {
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          phone: phone,
          email: email,
        });

        router.replace('/login');
      } catch (firestoreError) {
        console.error("Erro ao salvar no Firestore:", firestoreError);
        setErrorMessage('Erro ao salvar os dados no Firestore. Tente novamente.');
      }
      
    } catch (error) {
      console.error("Erro completo:", error);

      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Esse e-mail já está em uso. Tente outro.');
      } else {
        setErrorMessage('Erro ao tentar registrar. Tente novamente.');
      }
    }
  };

    return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar</Text>
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 25,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 45,
    textAlign: 'center',
    marginVertical: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  errorMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: 'red',
    marginBottom: 10,
  },
});
