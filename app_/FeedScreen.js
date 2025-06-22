// app_/FeedScreen.js (Sua tela principal de Feed)
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator // Para indicar carregamento
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Importe para uma área segura
import { useNavigation } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// O caminho abaixo está CORRETO para sua estrutura de pastas (app_/FeedScreen.js para firebaseConfig.js na raiz)
import { db } from '../firebaseConfig'; 
import { collection, getDocs, orderBy, query } from 'firebase/firestore'; // Importe funções do Firestore

export default function FeedScreen() {
    const navigation = useNavigation();
    const auth = getAuth();
    const [user, setUser] = useState(null); // Estado para o usuário logado
    const [posts, setPosts] = useState([]); // Estado para armazenar os posts
    const [loadingPosts, setLoadingPosts] = useState(true); // Estado de carregamento dos posts

    // Monitora o estado de autenticação do usuário
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Função para carregar os posts do Firestore
    useEffect(() => {
        const fetchPosts = async () => {
            setLoadingPosts(true);
            try {
                // Consulta a coleção 'posts' (ajuste o nome se for diferente no seu Firestore)
                const postsCollectionRef = collection(db, 'posts');
                // Opcional: ordenar por data de criação (garanta que seus posts tenham um campo 'createdAt' tipo Timestamp)
                const q = query(postsCollectionRef, orderBy('createdAt', 'desc')); 
                const querySnapshot = await getDocs(q);
                const fetchedPosts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Erro ao buscar posts:", error);
                // Você pode adicionar um estado de erro aqui para exibir ao usuário, se desejar
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchPosts();
    }, []); // O array vazio [] faz com que esta função seja executada apenas uma vez ao montar a tela

    // Função para lidar com a interação (curtir, comentar, etc.) - exige login
    const handleInteraction = () => {
        if (!user) { // Se o usuário NÃO estiver logado
            navigation.navigate('Login'); // Navega para a tela de Login
        } else {
            // Lógica para interagir com o post (curtir, comentar)
            alert("Usuário logado! Interação permitida. (Lógica real virá depois)");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}> {/* Use SafeAreaView aqui */}
            <ScrollView style={styles.scrollViewContent}> {/* Adicionado ScrollView para o conteúdo */}
                <Text style={styles.title}>Feed de Publicações</Text>
                <Text style={styles.subtitle}>
                    Bem-vindo! Veja as últimas publicações.
                </Text>

                {loadingPosts ? (
                    <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
                ) : posts.length === 0 ? (
                    <Text style={styles.noPostsText}>Nenhuma publicação encontrada ainda. Seja o primeiro a postar!</Text>
                ) : (
                    // Renderiza a lista de posts
                    posts.map(post => (
                        <View key={post.id} style={styles.postCard}>
                            <Text style={styles.postUser}>{post.userName || 'Usuário Desconhecido'}</Text>
                            <Text style={styles.postDescription}>{post.description}</Text>
                            {/* Se você tiver campos como imageUrl ou location, adicione-os aqui */}
                            {post.imageUrl && <Text style={styles.postDetail}>[Imagem: {post.imageUrl}]</Text>}
                            {post.location && <Text style={styles.postDetail}>Local: {post.location}</Text>}
                            {/* Opcional: Exibir a data de criação formatada */}
                            {post.createdAt && post.createdAt.seconds && ( // Garante que createdAt e seconds existem
                                <Text style={styles.postDate}>
                                    {new Date(post.createdAt.seconds * 1000).toLocaleString()}
                                </Text>
                            )}
                            <TouchableOpacity style={styles.interactButton} onPress={handleInteraction}>
                                <Text style={styles.interactButtonText}>
                                    {user ? "Curtir / Comentar" : "Login para Interagir"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* O botão flutuante de criar post foi REMOVIDO daqui. 
                A navegação já é feita pela TabBar inferior. */}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f2f5', // Fundo claro do feed
    },
    scrollViewContent: {
        flex: 1, // Para que o ScrollView ocupe o espaço disponível
        padding: 10,
        paddingTop: 20, // Ajuste para o conteúdo não ficar colado no topo
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 20,
    },
    loadingIndicator: {
        marginTop: 50,
    },
    noPostsText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 18,
        color: '#7f8c8d',
    },
    postCard: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    postUser: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3498db', // Azul para o nome do usuário
        marginBottom: 5,
    },
    postDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    postDetail: {
        fontSize: 14,
        color: '#95a5a6',
        marginTop: 5,
    },
    postDate: {
        fontSize: 12,
        color: '#b0b0b0',
        marginTop: 5,
        textAlign: 'right',
    },
    interactButton: {
        backgroundColor: '#ecf0f1', // Cinza claro para o botão de interação
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginTop: 10,
        alignSelf: 'flex-start', // Alinha o botão à esquerda
    },
    interactButtonText: {
        color: '#2c3e50',
        fontSize: 14,
        fontWeight: 'bold',
    },
    // Removidos os estilos createPostFloatingButton e createPostFloatingButtonText
    // pois o botão foi removido
});