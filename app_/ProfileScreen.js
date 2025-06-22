import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const [user, setUser] = useState(null); // Estado para armazenar os dados do usuário
    const navigation = useNavigation();

    useEffect(() => {
        const auth = getAuth();
        // onAuthStateChanged é um listener que é acionado sempre que o estado de autenticação muda (login, logout, etc.)
        const unsubscribe = auth.onAuthStateChanged((loggedInUser) => {
            if (loggedInUser) {
                setUser(loggedInUser); // Atualiza o estado com o usuário logado
            } else {
                setUser(null); // Limpa o estado se não houver usuário logado
            }
        });
        // Retorna uma função de limpeza para desinscrever o listener quando o componente for desmontado
        return () => unsubscribe();
    }, []); // O array vazio [] garante que o useEffect rode apenas uma vez ao montar o componente

    const handleLogout = async () => {
        try {
            const auth = getAuth(); // Obter a instância de autenticação aqui também, se não estiver global
            await auth.signOut();
            // A navegação para a tela de login será tratada automaticamente pelo App.js
            // que detecta a mudança no estado de autenticação.
        } catch (error) {
            console.error("Erro ao sair:", error);
            alert("Não foi possível sair. Tente novamente.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Seu Perfil</Text>
            {user ? ( // Renderiza o perfil se houver um usuário logado
                <View style={styles.userInfo}>
                    <Text style={styles.infoText}>Email: {user.email}</Text>
                    {/* Alterado: Exibir user.displayName. Se for null/undefined, mostra 'Não definido' */}
                    <Text style={styles.infoText}>Nome: {user.displayName || 'Não definido'}</Text>
                    {/* REMOVIDO: A linha que exibia o UID foi removida */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Sair</Text>
                    </TouchableOpacity>
                </View>
            ) : ( // Renderiza mensagem se não houver usuário logado
                <Text>Nenhum usuário logado.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    userInfo: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 10,
        color: '#555',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginTop: 20,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});