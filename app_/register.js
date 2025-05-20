import React, { useState } from 'react';
import { SafeAreaView, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { EmailInput, PasswordInput } from '../components/CustomInputs';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';

export default function Register() {
  const navigation = useNavigation();

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

      console.log('Navegando para a tela de Login...'); // Adicionado para depuração
      navigation.replace('Login');
    } catch (error) {
      setErrorMessage(error.message);
      console.error('Erro durante o registro:', error); // Adicionado para depuração
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Registrar-se</Text>
        <EmailInput value={email} setValue={setEmail} placeholder="E-mail" />
        <PasswordInput
          value={password}
          setValue={setPassword}
          placeholder="Senha"
        />
        <EmailInput value={name} setValue={setName} placeholder="Nome" />
        <EmailInput value={phone} setValue={setPhone} placeholder="Telefone" />

        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        <PrimaryButton text={'Registrar-se'} action={handleRegister} />

        <Text style={styles.loginTextBelowButton}>Já tem uma conta?</Text>
        <SecondaryButton text={'Entrar'} action={() => navigation.navigate('Login')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 45,
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
    marginBottom: 20,
  },
  loginTextBelowButton: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});
