// firebaseConfig.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { Platform } from "react-native";
import { getFirestore } from "firebase/firestore";

// Configurações do Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Auth
const auth = getAuth(app);

// Se estiver testando no navegador (web), define a persistência local do navegador
if (Platform.OS === "web") {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Erro ao configurar persistência no navegador:", error);
  });
}

// Inicializa o Firestore
const db = getFirestore(app);

export { app, auth, db };
