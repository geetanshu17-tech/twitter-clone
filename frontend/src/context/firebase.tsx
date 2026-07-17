// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
const firebaseConfig = {
  apiKey: "AIzaSyBMbR9aYnLrU3dtDmUraVlKi3cRNqgdptA",
  authDomain: "twitter-a8ac6.firebaseapp.com",
  projectId: "twitter-a8ac6",
  storageBucket: "twitter-a8ac6.firebasestorage.app",
  messagingSenderId: "897416383854",
  appId: "1:897416383854:web:da7e395f12399757ab457f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export default app