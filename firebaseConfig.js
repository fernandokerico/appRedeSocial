// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Inicializa o app
const app = initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
});

// Inicializa a autenticação com persistência no React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export {
  auth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  db
};
