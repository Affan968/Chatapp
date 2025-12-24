
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
  import { getFirestore, collection, addDoc,setDoc,doc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBM-oD81V9HIAGrRiLCQGh8lPP-UmuaidI",
    authDomain: "chataap-5522c.firebaseapp.com",
    projectId: "chataap-5522c",
    storageBucket: "chataap-5522c.firebasestorage.app",
    messagingSenderId: "356212896262",
    appId: "1:356212896262:web:0757ac8df51ae0c3244987",
    measurementId: "G-K7YCE25GM0"
  };

  // Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  createUserWithEmailAndPassword,
  auth,
  signInWithEmailAndPassword,
  db,
  collection,
  addDoc,
  setDoc,
  doc

}