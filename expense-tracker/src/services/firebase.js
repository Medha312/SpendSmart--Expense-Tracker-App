// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNAt-yyBvKTQWMXZISRkVOKqq70eznyuQ",
  authDomain: "expense-tracker-f7e94.firebaseapp.com",
  projectId: "expense-tracker-f7e94",
  storageBucket: "expense-tracker-f7e94.firebasestorage.app",
  messagingSenderId: "63853597393",
  appId: "1:63853597393:web:771314addc9ff5133d2bf0",
  measurementId: "G-X3B8R3W90D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Google provider
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
