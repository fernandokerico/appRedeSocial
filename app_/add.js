import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

const AddExpense = () => {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const user = auth.currentUser;

  const handleAdd = async () => {
    if (!description || !value || !date) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      const expenseData = {
        description,
        value: parseFloat(value),
        date: new Date(date),
      };

      await addDoc(collection(db, 'users', user.uid, 'expenses'), expenseData);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o gasto.');
      console.error(error);
    }
  };

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

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Adicionar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
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
  button: {
    marginTop: 24,
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedDateText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddExpense;
