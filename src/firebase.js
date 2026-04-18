import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBDdDQAFAQci3oSQVkQIBwvfjBDOg6Tuw0",
    authDomain: "resqmeal-d62cb.firebaseapp.com",
    projectId: "resqmeal-d62cb",
    storageBucket: "resqmeal-d62cb.firebasestorage.app",
    messagingSenderId: "638632658861",
    appId: "1:638632658861:web:30b7b4232fb1f82950324"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
