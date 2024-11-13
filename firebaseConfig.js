import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBggpum1Yk8Wo1j9JngJlUzl8xD3MWgRvE",
    authDomain: "the-nexus-league.firebaseapp.com",
    projectId: "the-nexus-league",
    storageBucket: "the-nexus-league.appspot.com",
    messagingSenderId: "421741514219",
    appId: "1:421741514219:web:d5e09950c4d87b88415dae",
    measurementId: "G-BM1DC0XDYV"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const colRef = collection(db, 'teams')