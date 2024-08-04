// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPaJPTciPkhygFE370u2XUgQNLX2olqyE",
  authDomain: "pantry-tracker-dee91.firebaseapp.com",
  projectId: "pantry-tracker-dee91",
  storageBucket: "pantry-tracker-dee91.appspot.com",
  messagingSenderId: "988863645503",
  appId: "1:988863645503:web:256c6294b22a4d7225758a",
  measurementId: "G-1D6SHJ2YJS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore};