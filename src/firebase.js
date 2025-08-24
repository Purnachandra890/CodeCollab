// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyD4yP9piTNPOKUh0U0Qi-cahSJgOqJDq6s",
  authDomain: "dsa-hub-47606.firebaseapp.com",
  projectId: "dsa-hub-47606",
  storageBucket: "dsa-hub-47606.firebasestorage.app",
  messagingSenderId: "495528942894",
  appId: "1:495528942894:web:44bd28a3aa33cb9885eebf",
  measurementId: "G-65LHH7K47S"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);


// ✅ Export auth instance
export const auth = getAuth(app);
export const db = getFirestore(app); // 🔹 ADD THIS LINE