import { useLocalSearchParams, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Modal, // Importe o Modal
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { Calendar } from 'react-native-calendars'; // Importe o Calendar

export default function EditExpense() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [description, setDescription] = useState("");
    const [value, setValue] = useState("");
    const [date, setDate] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // Novo estado para o modal

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoggedIn(!!user);
            if (!user) {
                router.replace("/login");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isLoggedIn && user && id) {
            const loadExpenseData = async () => {
                setLoading(true);
                try {
                    const docRef = doc(db, "users", user.uid, "expenses", id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setDescription(data.description);
                        setValue(data.value?.toString() || "");
                        const dateObj = data.date?.toDate();
                        setDate(dateObj ? dateObj.toISOString().split("T")[0] : "");
                    } else {
                        Alert.alert("Erro", "Gasto não encontrado.");
                        router.replace("/home");
                    }
                } catch (error) {
                    Alert.alert("Erro", "Não foi possível carregar o gasto.");
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            loadExpenseData();
        } else if (isLoggedIn && user && !id) {
            Alert.alert("Erro", "ID do gasto inválido.");
            router.replace("/home");
        }
    }, [isLoggedIn, user, id, router]);

    const handleUpdate = async () => {
        if (!description || !value || !date) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }
        try {
            const docRef = doc(db, "users", user.uid, "expenses", id);
            await updateDoc(docRef, {
                description,
                value: parseFloat(value),
                date: new Date(date),
            });
            router.replace("/home");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível atualizar o gasto.");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!isLoggedIn) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Descrição:</Text>
            <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
            />
            <Text style={styles.label}>Valor:</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
            />
            <Text style={styles.label}>Data:</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.datePickerText}>
                    {date ? date : 'Selecionar Data'}
                </Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    {modalVisible && <View style={styles.overlay} />}
                    <View style={styles.modalView}>
                        <Calendar
                            style={styles.calendarModal}
                            onDayPress={(day) => {
                                setDate(day.dateString);
                                setModalVisible(false);
                            }}
                            markedDates={date ? {
                                [date]: { selected: true, disableTouchEvent: true, selectedDotColor: 'blue' }
                            } : {}}
                        />
                        <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={() => setModalVisible(false)}>
                            <Text style={styles.buttonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {date ? (
                <Text style={styles.selectedDateText}>Data Selecionada: {date}</Text>
            ) : (
                <Text style={styles.selectedDateText}>Nenhuma data selecionada</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Salvar Alterações</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#fff",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 10,
        marginTop: 4,
    },
    button: {
        marginTop: 24,
        backgroundColor: "#3b82f6",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        marginTop: 4,
        alignItems: 'flex-start',
    },
    datePickerText: {
        fontSize: 16,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    calendarModal: {
        borderRadius: 10,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    selectedDateText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: 'bold',
    },
});