import { useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,

} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"; 
import { db } from "../firebaseConfig";

export default function CommentScreen() {
  const route = useRoute();
  const { postId } = route.params;
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const insets = useSafeAreaInsets(); 

  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const commentsRef = collection(db, "posts", postId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(fetchedComments);
        setLoadingComments(false);
      },
      (error) => {
        console.error("Erro ao carregar comentários:", error);
        Alert.alert("Erro", "Não foi possível carregar os comentários.");
        setLoadingComments(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  const handleAddComment = useCallback(async () => {
    if (!newCommentText.trim()) {
      Alert.alert("Erro", "O comentário não pode estar vazio.");
      return;
    }
    if (!currentUser) {
      Alert.alert("Erro", "Você precisa estar logado para comentar.");
      return;
    }

    try {
      let userNameToSave = currentUser.email || "Usuário Desconhecido";
      let userProfileImageUrlToSave = null;

      if (currentUser.uid) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          userNameToSave = userData.name || userData.email || userNameToSave;
          userProfileImageUrlToSave = userData.profileImageUrl || null;
        }
      }

      await addDoc(collection(db, "posts", postId, "comments"), {
        userId: currentUser.uid,
        userName: userNameToSave,
        userProfileImageUrl: userProfileImageUrlToSave,
        text: newCommentText.trim(),
        createdAt: serverTimestamp(),
      });

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        commentCount: increment(1),
      });

      setNewCommentText("");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      Alert.alert("Erro", "Não foi possível adicionar o comentário.");
    }
  }, [newCommentText, postId, currentUser]);

  const renderComment = ({ item }) => (
    <View style={commentStyles.commentCard}>
      <Image
        source={
          item.userProfileImageUrl
            ? { uri: item.userProfileImageUrl }
            : require("../assets/images/default-avatar.png")
        }
        style={commentStyles.commentAvatar}
      />
      <View style={commentStyles.commentContent}>
        <Text style={commentStyles.commentUserName}>
          {item.userName || "Usuário Desconhecido"}
        </Text>
        <Text style={commentStyles.commentText}>{item.text}</Text>
        {item.createdAt && item.createdAt.seconds && (
          <Text style={commentStyles.commentDate}>
            {new Date(item.createdAt.seconds * 1000).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );

  return (

    <View style={commentStyles.fullScreenContainer}> 
      <Text style={commentStyles.title}>Comentários</Text>

      {loadingComments ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={commentStyles.loadingIndicator}
        />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={commentStyles.listContent}
          ListEmptyComponent={() => (
            <Text style={commentStyles.emptyCommentsText}>
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </Text>
          )}
        />
      )}

      <View
        style={[
          commentStyles.inputContainer,
          { paddingBottom: insets.bottom + 10 }, 
        ]}
      >
        <TextInput
          style={commentStyles.commentInput}
          placeholder="Adicione um comentário..."
          value={newCommentText}
          onChangeText={setNewCommentText}
          multiline
        />
        <TouchableOpacity
          style={commentStyles.sendButton}
          onPress={handleAddComment}
        >
          <Text style={commentStyles.sendButtonText}>Publicar</Text>
        </TouchableOpacity>
      </View>
    </View>
 
  );
}

const commentStyles = StyleSheet.create({
  // safeArea: { // Remova ou comente este estilo se não for mais usado
  //   flex: 1,
  //   backgroundColor: "#f0f2f5",
  // },
  fullScreenContainer: { 
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  container: { 
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  loadingIndicator: {
    marginTop: 50,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 10, 
  },
  emptyCommentsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#7f8c8d",
  },
  commentCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  commentAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: "#555",
  },
  commentDate: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 4,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#f0f2f5",
    
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});