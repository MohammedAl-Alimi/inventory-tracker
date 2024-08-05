// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2Pj5FVCzo9SSqpPCLGF1VEolHtN4b4UE",
  authDomain: "inventory-management-dfe7a.firebaseapp.com",
  projectId: "inventory-management-dfe7a",
  storageBucket: "inventory-management-dfe7a.appspot.com",
  messagingSenderId: "977313139428",
  appId: "1:977313139428:web:4e1ffecb33fc83988c3af1",
  measurementId: "G-H67ZLVGG1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore};