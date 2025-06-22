// app_/CreatePostScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
    Image, // Importe Image para exibir a miniatura
    ActivityIndicator // Para indicar carregamento ao selecionar imagem ou postar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Importe o ImagePicker
import * as ImagePicker from 'expo-image-picker';

export default function CreatePostScreen() {
    const navigation = useNavigation();
    const auth = getAuth();
    const user = auth.currentUser;

    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState(null); // Agora armazena a URI local da imagem
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [imagePicking, setImagePicking] = useState(false); // Novo estado para controle do ImagePicker

    // Função para selecionar imagem da galeria
    const pickImage = async () => {
        setImagePicking(true);
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true, // Permite cortar/editar a imagem
                aspect: [4, 3], // Proporção do corte
                quality: 1, // Qualidade da imagem (0 a 1)
            });

            if (!result.canceled) {
                // 'uri' é o caminho local da imagem selecionada
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Erro ao selecionar imagem:", error);
            Alert.alert("Erro", "Não foi possível selecionar a imagem.");
        } finally {
            setImagePicking(false);
        }
    };

    // Função para tirar foto com a câmera (opcional, mas útil)
    const takePhoto = async () => {
        setImagePicking(true);
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permissão necessária", "Precisamos da permissão da câmera para tirar fotos.");
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
            Alert.alert("Erro", "Você precisa estar logado para criar uma publicação.");
            navigation.navigate('Login');
            return;
        }

        if (!description.trim()) {
            Alert.alert("Atenção", "A descrição da publicação não pode estar vazia.");
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'posts'), {
                userId: user.uid,
                userName: user.displayName || user.email,
                description: description,
                // Agora salva a URI local da imagem
                imageUrl: imageUri, // O campo continua sendo 'imageUrl' para compatibilidade
                location: location || null,
                createdAt: serverTimestamp(),
            });

            Alert.alert("Sucesso", "Publicação criada com sucesso!");
            setDescription('');
            setImageUri(null); // Limpa a URI da imagem
            setLocation('');
            navigation.navigate('Feed');
        } catch (error) {
            console.error("Erro ao criar publicação:", error);
            Alert.alert("Erro", "Não foi possível criar a publicação. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Criar Nova Publicação</Text>

            <TextInput
                style={styles.input}
                placeholder="Escreva sua publicação aqui..."
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
            />

            {/* Removido o TextInput para URL de imagem e adicionado botões de seleção */}
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
            
            {imagePicking && <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10 }} />}

            {imageUri && (
                <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
                        <Text style={styles.removeImageButtonText}>Remover Imagem</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TextInput
                style={styles.input}
                placeholder="Localização (opcional)"
                value={location}
                onChangeText={setLocation}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleCreatePost}
                disabled={loading || imagePicking}
            >
                {loading ? (
                    <Text style={styles.buttonText}>Salvando...</Text>
                ) : (
                    <Text style={styles.buttonText}>Publicar</Text>
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
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        padding: 20,
        paddingTop: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#34495e',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 8,
        borderColor: '#ced4da',
        borderWidth: 1,
        marginBottom: 15,
        fontSize: 16,
        color: '#495057',
        textAlignVertical: 'top',
    },
    imagePickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 15,
    },
    pickImageButton: {
        backgroundColor: '#007bff', // Azul para os botões de imagem
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    pickImageButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    imagePreviewContainer: {
        marginTop: 10,
        marginBottom: 15,
        alignItems: 'center',
        width: '100%',
    },
    imagePreview: {
        width: 200,
        height: 150,
        borderRadius: 8,
        resizeMode: 'cover', // Garante que a imagem preencha a área
        borderWidth: 1,
        borderColor: '#ddd',
    },
    removeImageButton: {
        backgroundColor: '#dc3545', // Vermelho
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginTop: 10,
    },
    removeImageButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        backgroundColor: '#6c757d',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});