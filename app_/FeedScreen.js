import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebaseConfig";
import { Ionicons } from '@expo/vector-icons';

export default function FeedScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usersProfileData, setUsersProfileData] = useState({});

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const postsCollectionRef = collection(db, "posts");
      const q = query(postsCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const fetchedPosts = [];
      const userIdsToFetch = new Set();

      querySnapshot.docs.forEach((postDoc) => {
        const postData = { id: postDoc.id, ...postDoc.data() };
        fetchedPosts.push(postData);
        if (postData.userId) {
          userIdsToFetch.add(postData.userId);
        }
      });

      // Busca dados de perfil dos usuários
      const newUsersProfileData = { ...usersProfileData }; // Começa com dados já cacheados
      const fetchUserPromises = Array.from(userIdsToFetch).map(async (userId) => {
        if (!newUsersProfileData[userId]) { // Se o perfil não está no cache
          const userDocRef = doc(db, "users", userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            newUsersProfileData[userId] = userDocSnap.data();
          } else {
            newUsersProfileData[userId] = { name: "Usuário Desconhecido", profileImageUrl: null };
          }
        }
      });

      // Aguarda todos os perfis serem buscados antes de processar os posts
      await Promise.all(fetchUserPromises);
      setUsersProfileData(newUsersProfileData); // Atualiza o cache de perfis

      const postsWithUserData = fetchedPosts.map((post) => {
        const userData = newUsersProfileData[post.userId];
        return {
          ...post,
          displayUserName: userData?.name || "Usuário Desconhecido",
          displayProfileImageUrl: userData?.profileImageUrl || require("../assets/images/default-avatar.png"),
          likes: post.likes || [],
          commentCount: post.commentCount || 0, // <-- GARANTIR QUE commentCount É LIDO
        };
      });
      setPosts(postsWithUserData);

    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      Alert.alert("Erro", "Não foi possível carregar as publicações.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usersProfileData]); // Adicione usersProfileData como dependência

  const handleLikeToggle = useCallback(async (postId, currentLikes = []) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        Alert.alert("Erro", "Você precisa estar logado para curtir.");
        return;
    }

    const postRef = doc(db, "posts", postId);
    const hasLiked = currentLikes.includes(userId);

    try {
        if (hasLiked) {
            await updateDoc(postRef, {
                likes: arrayRemove(userId)
            });
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, likes: post.likes.filter(id => id !== userId) }
                        : post
                )
            );
        } else {
            await updateDoc(postRef, {
                likes: arrayUnion(userId)
            });
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, likes: [...(post.likes || []), userId] }
                        : post
                )
            );
        }
    } catch (error) {
        console.error("Erro ao curtir/descurtir:", error);
        Alert.alert("Erro", "Não foi possível registrar sua curtida.");
    }
  }, [auth.currentUser?.uid]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      // Não há necessidade de um cleanup específico aqui para listeners de posts
      // porque getDocs é uma chamada única.
      // O cleanup para listeners de realtime (onSnapshot) estaria em um useEffect dedicado.
    }, [fetchPosts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setUsersProfileData({}); // Limpar o cache de usuários para garantir re-busca em refresh
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      fetchPosts(); // Recarrega os posts após a exclusão
    } catch (error) {
      console.error("Erro ao excluir post:", error);
      Alert.alert("Erro", "Não foi possível excluir a publicação.");
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <TouchableOpacity
        style={styles.postHeader}
        onPress={() => {
          const currentUserId = auth.currentUser?.uid;
          if (item.userId === currentUserId) {
            navigation.navigate("Profile");
          } else {
            navigation.navigate("OtherUserProfile", {
              userId: item.userId,
              userName: item.displayUserName,
              profileImageUrl: typeof item.displayProfileImageUrl === "string" ? item.displayProfileImageUrl : null,
            });
          }
        }}
      >
        <Image
          source={
            typeof item.displayProfileImageUrl === "string"
              ? { uri: item.displayProfileImageUrl }
              : item.displayProfileImageUrl
          }
          style={styles.postAvatar}
        />
        <Text style={styles.postUsername}>
          {item.displayUserName}
        </Text>
      </TouchableOpacity>

      <Text style={styles.postDescription}>{item.description}</Text>

      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.postImage}
          onError={(e) =>
            console.log("Erro ao carregar imagem do post:", e.nativeEvent.error)
          }
        />
      )}

      {/* Seção de Curtidas e Comentários */}
      <View style={styles.postActions}>
          <View style={styles.actionItem}>
            <TouchableOpacity onPress={() => handleLikeToggle(item.id, item.likes)}>
                <Ionicons
                    name={item.likes?.includes(auth.currentUser?.uid) ? "heart" : "heart-outline"}
                    size={24}
                    color={item.likes?.includes(auth.currentUser?.uid) ? "red" : "gray"}
                />
            </TouchableOpacity>
            <Text style={styles.likesCount}>{item.likes?.length || 0}</Text>
          </View>

          {/* Botão de Comentários */}
          <View style={styles.actionItem}>
            <TouchableOpacity
                onPress={() => navigation.navigate("CommentScreen", { postId: item.id })}
            >
                <Ionicons name="chatbubble-outline" size={24} color="gray" />
            </TouchableOpacity>
            <Text style={styles.commentCount}>{item.commentCount || 0}</Text>
          </View>
      </View>
      {/* Fim da Seção de Curtidas e Comentários */}

      {item.location && (
        <Text style={styles.postDetail}>Local: {item.location}</Text>
      )}
      {item.createdAt && item.createdAt.seconds && (
        <Text style={styles.postDate}>
          {new Date(item.createdAt.seconds * 1000).toLocaleString()}
        </Text>
      )}

      {auth.currentUser?.uid === item.userId && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert(
              "Excluir Post",
              "Tem certeza que deseja excluir esta publicação?",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Excluir", onPress: () => handleDeletePost(item.id) },
              ]
            )
          }
        >
          <Text style={styles.deleteButtonText}>Excluir Post</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Feed de Publicações</Text>

        {loading && posts.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loadingIndicator}
          />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <Text style={styles.emptyFeedText}>
                Nenhuma publicação ainda. Seja o primeiro a postar!
              </Text>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#0000ff"]}
                tintColor={"#0000ff"}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    color: "#333",
  },
  loadingIndicator: {
    marginTop: 50,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyFeedText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#7f8c8d",
  },
  postCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  postUsername: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  postDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  postDetail: {
    fontSize: 14,
    color: "#95a5a6",
    marginTop: 5,
  },
  postDate: {
    fontSize: 12,
    color: "#b0b0b0",
    marginTop: 5,
    textAlign: "right",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "flex-end",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    marginBottom: 5,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  likesCount: {
    marginLeft: 5,
    fontSize: 14,
    color: "#555",
  },
  commentCount: {
    marginLeft: 5,
    fontSize: 14,
    color: "#555",
  },
});