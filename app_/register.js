import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton, SecondaryButton } from "../components/Buttons";
import { EmailInput, PasswordInput } from "../components/CustomInputs";
import { auth, db } from "../firebaseConfig";

export default function Register() {
    const navigation = useNavigation();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async () => {
        if (!email || !password || !name || !phone) {
            setErrorMessage("Informe todos os campos.");
            return;
        }

        if (!regexEmail.test(email)) {
            setErrorMessage("E-mail inválido.");
            return;
        }

        if (!regexPassword.test(password)) {
            setErrorMessage(
                "A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial."
            );
            return;
        }

        setErrorMessage("");
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: name,
            });

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                phone: phone,
                email: email,
                profileImageUrl: null,
            });

            Alert.alert("Sucesso", "Registro realizado!");
            console.log(
                "Usuário registrado e perfil atualizado com nome:",
                user.displayName
            );
        } catch (error) {
            let userFriendlyMessage =
                "Ocorreu um erro desconhecido durante o registro.";
            if (error.code === "auth/email-already-in-use") {
                userFriendlyMessage = "Este e-mail já está em uso.";
            } else if (error.code === "auth/invalid-email") {
                userFriendlyMessage = "Formato de e-mail inválido.";
            } else if (error.code === "auth/weak-password") {
                userFriendlyMessage =
                    "A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.";
            }
            setErrorMessage(userFriendlyMessage);
            console.error("Erro durante o registro:", error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
            <View style={styles.container}>
                <Text style={styles.title}>Registrar-se</Text>

                <EmailInput
                    value={name}
                    setValue={setName}
                    placeholder="Nome Completo"
                />
                <EmailInput value={email} setValue={setEmail} placeholder="E-mail" />
                <PasswordInput
                    value={password}
                    setValue={setPassword}
                    placeholder="Senha"
                />
                <EmailInput value={phone} setValue={setPhone} placeholder="Telefone" />

                {errorMessage && (
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                )}

                <PrimaryButton text={"Registrar-se"} action={handleRegister} />

                <Text style={styles.loginTextBelowButton}>Já tem uma conta?</Text>
                <SecondaryButton
                    text={"Entrar"}
                    action={() => navigation.navigate("Login")}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 25,
        justifyContent: "center",
    },
    title: {
        fontSize: 45,
        textAlign: "center",
        marginBottom: 40,
        color: "#333",
    },
    errorMessage: {
        fontSize: 16,
        textAlign: "center",
        color: "red",
        marginBottom: 20,
    },
    loginTextBelowButton: {
        textAlign: "center",
        marginTop: 10,
        fontSize: 16,
        color: "#555",
    },
});