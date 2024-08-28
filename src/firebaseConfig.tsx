

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3feTvRRJSGX9INMwgSAmqphomXYDFHa4",
  authDomain: "game-story-aa872.firebaseapp.com",
  projectId: "game-story-aa872",
  storageBucket: "game-story-aa872.appspot.com",
  messagingSenderId: "978010872210",
  appId: "1:978010872210:web:639ca8649fea3ee688c94b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);