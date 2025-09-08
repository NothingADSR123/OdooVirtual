import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "ENTER YOUR API KEY HERE",
  authDomain: "odoovirtual.firebaseapp.com",
  projectId: "odoovirtual",
  storageBucket: "odoovirtual.firebasestorage.app",
  messagingSenderId: "253667739948",
  appId: "1:253667739948:web:0b708271c7407b875f8489",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();
