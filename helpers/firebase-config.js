// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIf7y3e-ylfcktqtRg1nzdGSIoHk9UjYg",
  authDomain: "nitfee-93b4a.firebaseapp.com",
  projectId: "nitfee-93b4a",
  storageBucket: "nitfee-93b4a.appspot.com",
  messagingSenderId: "170444907384",
  appId: "1:170444907384:web:093beea78429e841789e8d",
  measurementId: "G-MEBQ4TJCH4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
