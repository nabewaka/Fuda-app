// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcS6lA9HvK6oJOEGS8freMfGQe5XLAbQ8",
  authDomain: "fuda-app.firebaseapp.com",
  projectId: "fuda-app",
  storageBucket: "fuda-app.firebasestorage.app",
  messagingSenderId: "319687973449",
  appId: "1:319687973449:web:f7d73605c4a011243f7d98",
  measurementId: "G-F9KTBQZ23J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 