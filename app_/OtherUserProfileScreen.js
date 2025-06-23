import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity, 
    Image, 
    Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native'; 
import { db } from '../firebaseConfig'; 
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'; 

export default function OtherUserProfileScreen() {
    const route = useRoute(); 
    const navigation = useNavigation(); 
    const { userId, userName: initialUserName } = route.params; 

    const [userData, setUserData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        const fetchUserProfileAndPosts = async () => {
            
            setLoadingProfile(true);
            try {
                const userDocRef = doc(db, 'users', userId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data());
                } else {
                    console.log("No such user document!");
                    Alert.alert("Erro", "Perfil de usuário não encontrado.");
                }
            } catch (error) {
                console.error("Erro ao buscar perfil do usuário:", error);
                Alert.alert("Erro", "Não foi possível carregar o perfil.");
            } finally {
                setLoadingProfile(false);
            }

            
            setLoadingPosts(true);
            try {
                const postsCollectionRef = collection(db, 'posts');
                const q = query(postsCollectionRef,
                                where('userId', '==', userId), 
                                orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetchedPosts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUserPosts(fetchedPosts);
            } catch (error) {
                console.error("Erro ao buscar posts do usuário:", error);
                Alert.alert("Erro", "Não foi possível carregar as publicações deste usuário.");
            } finally {
                setLoadingPosts(false);
            }
        };

        if (userId) {
            fetchUserProfileAndPosts();
        }
    }, [userId]); 

    if (loadingProfile || loadingPosts) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Carregando perfil e publicações...</Text>
            </View>
        );
    }

    
    if (!userData) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Perfil Não Encontrado</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollViewContent}>
                <TouchableOpacity style={styles.backButtonHeader} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonTextHeader}>{"< Voltar"}</Text>
                </TouchableOpacity>

                {}
                <View style={styles.profileHeader}>
                    {}
                    {}
                    <Text style={styles.profileName}>{userData.fullName || initialUserName || 'Nome Desconhecido'}</Text>
                    <Text style={styles.profileDetail}>Email: {userData.email || 'Não informado'}</Text>
                    <Text style={styles.profileDetail}>Telefone: {userData.phone || 'Não informado'}</Text>
                </View>

                {}
                <Text style={styles.postsTitle}>Publicações de {userData.fullName || initialUserName}</Text>
                
                {userPosts.length === 0 ? (
                    <Text style={styles.noPostsText}>Este usuário ainda não fez publicações.</Text>
                ) : (
                    userPosts.map(post => (
                        <View key={post.id} style={styles.postCard}>
                            {}
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
                            {}
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
        flexGrow: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    backButtonHeader: {
        alignSelf: 'flex-start',
        marginBottom: 15,
        padding: 5,
    },
    backButtonTextHeader: {
        fontSize: 18,
        color: '#007bff',
        fontWeight: 'bold',
    },
    profileHeader: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e0e0e0', 
        marginBottom: 10,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    profileDetail: {
        fontSize: 16,
        color: '#555',
        marginBottom: 3,
    },
    postsTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        marginTop: 10,
        textAlign: 'center',
    },
    noPostsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 20,
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
    backButton: { 
        marginTop: 20,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
    },
    backButtonText: { 
        color: '#fff',
        fontSize: 16,
    },
});