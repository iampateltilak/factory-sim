// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// REPLACE THE OBJECT BELOW WITH YOUR ACTUAL FIREBASE CONFIG FROM STEP 1
const firebaseConfig = {
  apiKey: "AIzaSyBIE90jS2oLIffuj5wyD7G3qdChPS0K10Q",
  authDomain: "factory-sim-db.firebaseapp.com",
  projectId: "factory-sim-db",
  storageBucket: "factory-sim-db.firebasestorage.app",
  messagingSenderId: "959474366708",
  appId: "1:959474366708:web:f37961966db0366b34c6a1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
