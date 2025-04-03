import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import { info } from "./env";

const firebaseConfig = {
  apiKey: info.apiKey,
  authDomain: info.authDomain,
  projectId: info.projectId,
  storageBucket: info.storageBucket,
  messagingSenderId: info.messagingSenderId,
  appId: info.appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
export const db = getFirestore(app);