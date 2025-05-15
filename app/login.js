import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';  
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { EmailInput, PasswordInput } from '../components/CustomInputs';

export default function Login() {

    const router = useRouter();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const login = async () => {
        if (!email || !password) {
            setErrorMessage('Informe o e-mail e senha.');
            return;
        }

        if (!regexEmail.test(email)) {
            setErrorMessage('E-mail ou senha  inválidos');
            return;
        }

        setErrorMessage('');

        try {
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredentials.user;
            console.log(user);
            router.replace('/home'); 
        } catch (error) {
            setErrorMessage(error.message);
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

                <TouchableOpacity onPress={() => router.push('/forgotPassword')}>
                    <Text>Esqueci a senha</Text>
                </TouchableOpacity>

                {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

                <PrimaryButton text={'Login'} action={login} />

                <Text>Ainda não tem uma conta?</Text>

                <SecondaryButton text={'Registrar-se'} action={() => router.push('/register')} />
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
