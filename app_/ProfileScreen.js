import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker"; // Para selecionar foto
import { getAuth, signOut } from "firebase/auth"; // Importar signOut aqui
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Funções do Firestore
import { useEffect, useState } from "react";
import {
  ActivityIndicator, // Para indicadores de carregamento
  Alert, // Para campos de edição
  Image, // Para exibir e selecionar foto de perfil
  ScrollView, // Para garantir que a tela seja rolável
  StyleSheet,
  Text, // Para mensagens de alerta
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebaseConfig"; // Importar o db para Firestore

export default function ProfileScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUser = auth.currentUser; // O usuário atualmente logado

  const [userAuthData, setUserAuthData] = useState(null); // Dados do Firebase Authentication
  const [userData, setUserData] = useState(null); // Dados do Firestore (nome, telefone, foto)

  const [isEditing, setIsEditing] = useState(false); // Estado para controlar o modo de edição
  const [tempFullName, setTempFullName] = useState(""); // Estado temporário para o nome editável
  const [tempPhone, setTempPhone] = useState(""); // Estado temporário para o telefone editável
  const [tempProfileImageUrl, setTempProfileImageUrl] = useState(null); // Estado temporário para a URL da imagem de perfil

  const [loadingProfile, setLoadingProfile] = useState(true); // Indica se está carregando os dados do perfil
  const [isSaving, setIsSaving] = useState(false); // Indica se está salvando as alterações

  // Efeito para carregar os dados do usuário (Auth e Firestore)
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((loggedInUser) => {
      setUserAuthData(loggedInUser);
      if (loggedInUser) {
        fetchUserData(loggedInUser.uid);
      } else {
        setUserData(null);
        setLoadingProfile(false);
      }
    });

    // Limpeza do listener
    return () => unsubscribeAuth();
  }, []);

  // Função para buscar os dados do usuário no Firestore
  const fetchUserData = async (uid) => {
    setLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const fetchedData = userDocSnap.data();
        setUserData(fetchedData);
        // Preenche os estados temporários para edição
        // CORREÇÃO AQUI: De fetchedData.fullName para fetchedData.name
        setTempFullName(fetchedData.name || "");
        setTempPhone(fetchedData.phone || "");
        setTempProfileImageUrl(fetchedData.profileImageUrl || null);
      } else {
        // Se o documento do usuário não existir no Firestore, inicializa com valores vazios
        // CORREÇÃO AQUI: De fullName para name no setUserData inicial
        setUserData({ name: "", phone: "", profileImageUrl: null });
        setTempFullName("");
        setTempPhone("");
        setTempProfileImageUrl(null);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do perfil no Firestore:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do perfil.");
      setUserData(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Função para lidar com o logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // A navegação para a tela de login será tratada automaticamente pelo App.js
      // que detecta a mudança no estado de autenticação.
    } catch (error) {
      console.error("Erro ao sair:", error);
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
    }
  };

  // Função para selecionar/tirar foto de perfil
  const pickImage = async () => {
    // Pedir permissão para acessar a galeria (se ainda não tiver)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar sua galeria de fotos para mudar a foto de perfil."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Proporção para foto de perfil
      quality: 1,
    });

    if (!result.canceled) {
      setTempProfileImageUrl(result.assets[0].uri); // Define a URI local para exibição temporária
      Alert.alert(
        "Atenção",
        "Foto substituida ou adicionar com sucesso, apenas localmente!!!!"
      );
    }
  };

  // Função para salvar as alterações do perfil no Firestore
  const handleSaveChanges = async () => {
    setIsSaving(true);
    if (!currentUser) {
      Alert.alert("Erro", "Nenhum usuário logado.");
      setIsSaving(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        // CORREÇÃO AQUI: De Name para name (o 'N' maiúsculo pode ser um problema, use 'name' minúsculo)
        name: tempFullName, // Usando 'name' como o campo no Firestore
        phone: tempPhone,
        profileImageUrl: tempProfileImageUrl, // Salva a URI local ou a URL do storage
      });

      // Atualiza o estado principal 'userData' com os novos dados
      // CORREÇÃO AQUI: De fullName para name ao atualizar o estado userData
      setUserData((prev) => ({
        ...prev,
        name: tempFullName, // Usando 'name' para ser consistente
        phone: tempPhone,
        profileImageUrl: tempProfileImageUrl,
      }));

      setIsEditing(false); // Sai do modo de edição após salvar
    } catch (error) {
      console.error("Erro ao salvar alterações do perfil:", error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar as alterações. Tente novamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </SafeAreaView>
    );
  }

  // Se não houver usuário logado
  if (!userAuthData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Seu Perfil</Text>
        <Text>Nenhum usuário logado. Por favor, faça login.</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>Ir para Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Seu Perfil</Text>

        {/* Foto de Perfil */}
        <TouchableOpacity
          onPress={isEditing ? pickImage : null}
          style={styles.avatarContainer}
        >
          <Image
            // Usar tempProfileImageUrl para exibir a imagem selecionada ou a URL salva
            // Se não houver, usar o avatar padrão.
            source={
              tempProfileImageUrl
                ? { uri: tempProfileImageUrl }
                : require("../assets/images/default-avatar.png")
            }
            style={styles.profileAvatar}
          />
          {isEditing && <Text style={styles.changeAvatarText}>Mudar Foto</Text>}
        </TouchableOpacity>

        {isEditing ? (
          // Modo de Edição
          <View style={styles.editSection}>
            <TextInput
              style={styles.input}
              placeholder="Nome Completo"
              value={tempFullName}
              onChangeText={setTempFullName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={tempPhone}
              onChangeText={setTempPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                // Reseta os campos para os valores originais ao cancelar
                // CORREÇÃO AQUI: De userData?.fullName para userData?.name
                setTempFullName(userData?.name || "");
                setTempPhone(userData?.phone || "");
                setTempProfileImageUrl(userData?.profileImageUrl || null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Modo de Exibição
          <View style={styles.userInfo}>
            <Text style={styles.infoText}>Email: {userAuthData.email}</Text>
            {/* CORREÇÃO AQUI: De userData?.fullName para userData?.name */}
            <Text style={styles.infoText}>
              Nome: {userData?.name || "Não informado"}
            </Text>
            <Text style={styles.infoText}>
              Telefone: {userData?.phone || "Não informado"}
            </Text>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e0e0e0", // Cor de fundo para avatar padrão
    borderWidth: 2,
    borderColor: "#007bff",
  },
  changeAvatarText: {
    color: "#007bff",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
    color: "#555",
  },
  editSection: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#28a745", // Verde para salvar
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#6c757d", // Cinza para cancelar
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  editProfileButton: {
    backgroundColor: "#007bff", // Azul para editar
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10, // Adicionado margem para separar do logout
  },
  editProfileButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10, // Ajustado margem para não colar no editar
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
