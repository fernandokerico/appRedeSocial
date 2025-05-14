import { useState } from 'react';
import { TextInput, Button, View, Text, StyleSheet } from 'react-native';
import { auth } from '../firebaseConfig';  // Supondo que a configuração do Firebase esteja em firebaseConfig.js
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Instruções para redefinir a senha foram enviadas para o seu e-mail.');
    } catch (error) {
      setMessage('Erro ao tentar enviar a solicitação de redefinição.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Esqueci a Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Enviar Redefinição" onPress={handlePasswordReset} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  message: {
    color: 'green',
    marginTop: 10,
  },
});
