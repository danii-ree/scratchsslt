import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBUsCKENfDsxZoz26OL6ygit7DGcCvgI3s",
  authDomain: "scratcht-database.firebaseapp.com",
  projectId: "scratcht-database",
  storageBucket: "scratcht-database.firebasestorage.app",
  messagingSenderId: "551857954784",
  appId: "1:551857954784:web:894cd8c9ec3c25dcf5d585"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
export const db = getFirestore(app);