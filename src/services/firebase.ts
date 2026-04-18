import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAEdIl7iZMbNaCKmjWIX-603tx0Dw9G7o",
  authDomain: "vigie-75651.firebaseapp.com",
  projectId: "vigie-75651",
  storageBucket: "vigie-75651.firebasestorage.app",
  messagingSenderId: "392515869817",
  appId: "1:392515869817:web:9c331da811d64a0f3588a8",
  measurementId: "G-VHL5M3ZJGC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);