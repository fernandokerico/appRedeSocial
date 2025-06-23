import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePicking, setImagePicking] = useState(false);
  const [userNameFromFirestore, setUserNameFromFirestore] =
    useState("Carregando...");
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const fetchedName = userData.name;
            if (fetchedName) {
              setUserNameFromFirestore(fetchedName);
            } else {
              setUserNameFromFirestore(user.email || "Usuário Desconhecido");
            }
          } else {
            setUserNameFromFirestore(user.email || "Usuário Desconhecido");
          }
        } catch (error) {
          console.error("Erro ao buscar nome do usuário no Firestore:", error);
          setUserNameFromFirestore(user.email || "Usuário Desconhecido");
        }
      } else {
        setUserNameFromFirestore("Não Logado");
      }
    };

    fetchUserName();
  }, [user]);

  const fetchLocation = useCallback(async () => {
    setLoadingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão Necessária",
        "Para usar sua localização, por favor, habilite a permissão nas configurações do seu dispositivo."
      );
      setLoadingLocation(false);
      return;
    }

    try {
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (!currentLocation || !currentLocation.coords) {
        Alert.alert(
          "Erro de Localização",
          "Não foi possível obter coordenadas válidas. Tente novamente."
        );
        setLoadingLocation(false);
        return;
      }

      let geocodedAddress = await Location.reverseGeocodeAsync(
        currentLocation.coords
      );

      if (geocodedAddress && geocodedAddress.length > 0) {
        const { formattedAddress, postalCode } = geocodedAddress[0];

       
        let cleanedAddress = formattedAddress;
        if (postalCode && formattedAddress.includes(postalCode)) {
          cleanedAddress = formattedAddress
            .replace(`, ${postalCode}`, "")
            .trim();
          cleanedAddress = cleanedAddress.replace(`${postalCode}, `, "").trim();
          cleanedAddress = cleanedAddress.replace(`${postalCode}`, "").trim();
          cleanedAddress = cleanedAddress.replace(/,\s*$/, "").trim(); 
        }

        setLocation(cleanedAddress);
        Alert.alert(
          "Localização",
          `Localização atual preenchida: ${cleanedAddress}`
        );
      } else {
        setLocation("");
        Alert.alert(
          "Localização",
          "Não foi possível encontrar um endereço para sua localização."
        );
      }
    } catch (error) {
      console.error("Erro na fetchLocation:", error);
      Alert.alert(
        "Erro de Localização",
        "Não foi possível obter sua localização atual."
      );
      setLocation("");
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const pickImage = async () => {
    setImagePicking(true);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão Necessária",
          "Precisamos da permissão da sua galeria para escolher uma imagem."
        );
        setImagePicking(false);
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    } finally {
      setImagePicking(false);
    }
  };

  const takePhoto = async () => {
    setImagePicking(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão Necessária",
          "Precisamos da permissão da câmera para tirar fotos."
        );
        setImagePicking(false);
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    } finally {
      setImagePicking(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert(
        "Erro",
        "Você precisa estar logado para criar uma publicação."
      );
      navigation.navigate("Login");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Atenção", "A descrição da publicação não pode estar vazia.");
      return;
    }

    if (!imageUri) {
      Alert.alert(
        "Atenção",
        "Por favor, selecione ou tire uma foto para a publicação."
      );
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        userName: userNameFromFirestore,
        description: description.trim(),
        imageUrl: imageUri,
        location: location.trim() || null,
        createdAt: serverTimestamp(),
        likes: [],
        commentCount: 0,
      });

      Alert.alert("Sucesso", "Publicação criada com sucesso!");
      setDescription("");
      setImageUri(null);
      setLocation("");
      navigation.navigate("Feed");
    } catch (error) {
      console.error("Erro ao criar publicação:", error);
      Alert.alert(
        "Erro",
        "Não foi possível criar a publicação. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Criar Nova Publicação</Text>

      <TextInput
        style={styles.input}
        placeholder="Escreva sua publicação aqui..."
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.imagePickerButtons}>
        <TouchableOpacity
          style={styles.pickImageButton}
          onPress={pickImage}
          disabled={imagePicking || loading}
        >
          <Text style={styles.pickImageButtonText}>Escolher Imagem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pickImageButton}
          onPress={takePhoto}
          disabled={imagePicking || loading}
        >
          <Text style={styles.pickImageButtonText}>Tirar Foto</Text>
        </TouchableOpacity>
      </View>

      {imagePicking && (
        <ActivityIndicator
          size="small"
          color="#0000ff"
          style={styles.activityIndicator}
        />
      )}

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setImageUri(null)}
          >
            <Text style={styles.removeImageButtonText}>Remover Imagem</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.locationInputContainer}>
        <TextInput
          style={styles.locationInput}
          placeholder="Localização (opcional)"
          value={location}
          onChangeText={setLocation}
        />
        <TouchableOpacity
          style={styles.locationButton}
          onPress={fetchLocation}
          disabled={loadingLocation || loading}
        >
          {loadingLocation ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.locationButtonText}>
              Usar Localização Atual
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreatePost}
        disabled={loading || imagePicking || loadingLocation}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Publicar Treino</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    borderColor: "#ced4da",
    borderWidth: 1,
    marginBottom: 15,
    fontSize: 16,
    color: "#495057",
    textAlignVertical: "top",
  },
  imagePickerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  pickImageButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  pickImageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  activityIndicator: {
    marginTop: 10,
  },
  imagePreviewContainer: {
    marginTop: 10,
    marginBottom: 15,
    alignItems: "center",
    width: "100%",
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  removeImageButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  removeImageButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  locationInput: {
    flex: 1,
    height: 50,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginRight: 10,
    fontSize: 16,
    color: "#495057",
  },
  locationButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#27428f",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#6c757d",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
