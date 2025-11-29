import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
export const firebaseConfig = {
    apiKey: "AIzaSyCi8jafdCyvdYR7-QUfjpGtG-_D2fKwcWU",
    authDomain: "digital-hazri-strategiq.firebaseapp.com",
    projectId: "digital-hazri-strategiq",
    storageBucket: "digital-hazri-strategiq.firebasestorage.app",
    messagingSenderId: "839663384804",
    appId: "1:839663384804:web:a8313fefdc6ac5158ed4f1",
    measurementId: "G-5QDXW693J6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);
