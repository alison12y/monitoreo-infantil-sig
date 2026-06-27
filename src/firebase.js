import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3FicCo0d79qwYxu5HOuLFVf8CXQAWvC8",
  authDomain: "monitoreo-infantil-sig.firebaseapp.com",
  projectId: "monitoreo-infantil-sig",
  storageBucket: "monitoreo-infantil-sig.firebasestorage.app",
  messagingSenderId: "456758167121",
  appId: "1:456758167121:web:f568390169bcedf2645a70",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);