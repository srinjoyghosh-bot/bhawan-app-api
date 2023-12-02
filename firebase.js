// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAVRV70reYJ1cUStmYpPrwYgG0dPxmi2R4",
  authDomain: "bhawan-app-d23c1.firebaseapp.com",
  projectId: "bhawan-app-d23c1",
  storageBucket: "bhawan-app-d23c1.appspot.com",
  messagingSenderId: "550930333261",
  appId: "1:550930333261:web:531b9f8f6730fbd1a2a604",
  measurementId: "G-CEW6BNHL5R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


module.exports= { app, db };
