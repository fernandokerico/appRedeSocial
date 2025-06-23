import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};


let app;
try {
  console.log("Inicializando o Firebase...");
  app = initializeApp(firebaseConfig);
  console.log("Firebase inicializado com sucesso.");
} catch (error) {
  console.error("Erro ao inicializar o Firebase:", error);
  
  throw error; 
}


let auth;
if (Platform.OS === 'web') {
  console.log("Inicializando Auth para a web...");
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("Persistência da web definida com sucesso.");
      
    })
    .catch((err) => {
      console.error("Erro ao definir persistência da web:", err);

      throw err; 
    });
} else {
  console.log("Inicializando Auth para React Native...");
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
     console.log("Auth para React Native inicializado com sucesso.");
  } catch (error){
    console.error("Erro ao inicializar o Auth nativo:", error);
    throw error; 
  }
}


const db = getFirestore(app);
console.log("Firestore inicializado.");

export { app, auth, db };
