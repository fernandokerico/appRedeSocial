import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { EmailInput, PasswordInput } from '../components/CustomInputs';
import { auth } from '../firebaseConfig';

export default function Login() {

    const navigation = useNavigation();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const login = async () => {
        if (!email || !password) {
            setErrorMessage('Informe o e-mail e a senha.');
            return;
        }

        if (!regexEmail.test(email)) {
            setErrorMessage('E-mail ou Senha ou inválidos.');
            return;
        }

        if (!regexPassword.test(password)) {
          setErrorMessage("E-mail ou Senha ou inválidos.")
          return;
        }

        setErrorMessage('');

        try {
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredentials.user;
            console.log(user);
            navigation.replace('Home');
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                setErrorMessage('Credenciais inválidas. Verifique seu e-mail e senha.');
            } else {
                setErrorMessage('Erro ao iniciar sessão: ' + error.message); 
            }
        }
    };

    useEffect(() => {
        setErrorMessage('');
    }, [email, password]);

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Text style={styles.title}>Entrar</Text>
                <EmailInput value={email} setValue={setEmail} />
                <PasswordInput value={password} setValue={setPassword} />

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text>Esqueci a senha</Text>
                </TouchableOpacity>

                {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

                <PrimaryButton text={'Login'} action={login} />

                <Text>Ainda não tem uma conta?</Text>

                <SecondaryButton text={'Registrar-se'} action={() => navigation.navigate('Register')} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 25,
    },
    title: {
        fontSize: 45,
        textAlign: 'center',
        marginVertical: 40,
    },
    errorMessage: {
        fontSize: 18,
        textAlign: 'center',
        color: 'red',
    },
});
