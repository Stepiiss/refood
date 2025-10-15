// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDH4NWNWYoFFP0aqjomcOJRsYNTG1qDTCk",
  authDomain: "refood-bdbfa.firebaseapp.com",
  databaseURL: "https://refood-bdbfa-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "refood-bdbfa",
  storageBucket: "refood-bdbfa.firebasestorage.app",
  messagingSenderId: "803279119690",
  appId: "1:803279119690:web:c05d9c8847e9dde38e0db3",
  measurementId: "G-KRV296D9TQ"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };