// app_/FeedScreen.js (Sua tela principal de Feed)
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';

export default function FeedScreen() {
    const navigation = useNavigation();
    const auth = getAuth();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const fetchPosts = async () => {
        setLoadingPosts(true);
        try {
            const postsCollectionRef = collection(db, 'posts');
            const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const fetchedPosts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Erro ao buscar posts:", error);
            Alert.alert("Erro", "Não foi possível carregar as publicações.");
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [user]);

    const handleDeletePost = (postId) => {
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir esta publicação? Esta ação é irreversível.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            if (!user) {
                                Alert.alert("Erro", "Você precisa estar logado para excluir publicações.");
                                navigation.navigate('Login');
                                return;
                            }
                            
                            const postRef = doc(db, 'posts', postId);
                            await deleteDoc(postRef);

                            Alert.alert("Sucesso", "Publicação excluída com sucesso!");
                            setPosts(posts.filter(p => p.id !== postId)); 

                        } catch (error) {
                            console.error("Erro ao excluir publicação:", error);
                            Alert.alert("Erro", "Não foi possível excluir a publicação. Tente novamente.");
                        }
                    }
                }
            ]
        );
    };

    const handleInteraction = () => {
        if (!user) {
            navigation.navigate('Login');
        } else {
            Alert.alert("Interação", "Usuário logado! Aqui você poderia curtir ou comentar.");
        }
    };

    // Nova função para navegar para o perfil de outro usuário
    const navigateToOtherUserProfile = (userId, userName) => {
        // Verifica se é o próprio usuário logado e navega para a tela de perfil padrão,
        // ou para a tela de perfil de outro usuário.
        if (user && user.uid === userId) {
            navigation.navigate('Profile'); // Navega para seu próprio perfil
        } else {
            navigation.navigate('OtherUserProfile', { userId: userId, userName: userName });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollViewContent}>
                <Text style={styles.title}>Feed de Publicações</Text>
                <Text style={styles.subtitle}>
                    Bem-vindo! Veja as últimas publicações.
                </Text>

                {loadingPosts ? (
                    <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
                ) : posts.length === 0 ? (
                    <Text style={styles.noPostsText}>Nenhuma publicação encontrada ainda. Seja o primeiro a postar!</Text>
                ) : (
                    posts.map(post => (
                        <View key={post.id} style={styles.postCard}>
                            {/* Torna o nome do usuário clicável */}
                            <TouchableOpacity onPress={() => navigateToOtherUserProfile(post.userId, post.userName)}>
                                <Text style={styles.postUser}>{post.userName || 'Usuário Desconhecido'}</Text>
                            </TouchableOpacity>
                            
                            <Text style={styles.postDescription}>{post.description}</Text>
                            
                            {post.imageUrl && (
                                <Image 
                                    source={{ uri: post.imageUrl }} 
                                    style={styles.postImage} 
                                    onError={(e) => console.log('Erro ao carregar imagem:', e.nativeEvent.error)}
                                />
                            )}
                            
                            {post.location && <Text style={styles.postDetail}>Local: {post.location}</Text>}
                            {post.createdAt && post.createdAt.seconds && (
                                <Text style={styles.postDate}>
                                    {new Date(post.createdAt.seconds * 1000).toLocaleString()}
                                </Text>
                            )}

                            <View style={styles.postActions}>
                                <TouchableOpacity style={styles.interactButton} onPress={handleInteraction}>
                                    <Text style={styles.interactButtonText}>
                                        {user ? "Curtir / Comentar" : "Login para Interagir"}
                                    </Text>
                                </TouchableOpacity>

                                {user && user.uid === post.userId && (
                                    <TouchableOpacity 
                                        style={styles.deleteButton} 
                                        onPress={() => handleDeletePost(post.id)}
                                    >
                                        <Text style={styles.deleteButtonText}>Excluir</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    scrollViewContent: {
        flex: 1,
        padding: 10,
        paddingTop: 20,
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
        color: '#3498db',
        marginBottom: 5,
    },
    postDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
        resizeMode: 'cover',
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
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    interactButton: {
        backgroundColor: '#ecf0f1',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    interactButtonText: {
        color: '#2c3e50',
        fontSize: 14,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});