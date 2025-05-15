import { useState } from 'react';
import { SafeAreaView, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { EmailInput, PasswordInput } from '../components/CustomInputs';

export default function Register() {
  const router = useRouter();

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !name || !phone) {
      setErrorMessage('Informe todos os campos.');
      return;
    }

    if (!regexEmail.test(email)) {
      setErrorMessage('E-mail inválido.');
      return;
    }

    if (!regexPassword.test(password)) {
      setErrorMessage('A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial.');
      return;
    }

    setErrorMessage('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        phone: phone,
        email: email,
      });

      router.replace('/login');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.title}>Registar</Text>
        <EmailInput value={email} setValue={setEmail} placeholder="E-mail" />
        <PasswordInput value={password} setValue={setPassword} placeholder="Senha" />
        <EmailInput value={name} setValue={setName} placeholder="Nome" />
        <EmailInput value={phone} setValue={setPhone} placeholder="Telefone" />

        {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registar</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Já tem uma conta?
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ color: '#007BFF' }}> Entrar</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 25,
    padding: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  title: {
    fontSize: 45,
    textAlign: 'center',
    marginVertical: 40,
    fontWeight: 'bold',
    color: '#000000'
  },
  errorMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#00509e',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    marginTop: 10,
    alignItems: 'center',
    marginHorizontal: 0,
  },
  loginText: {
    fontSize: 16,
    color: '#000000',
  },
});

