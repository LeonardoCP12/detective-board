import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRvglSh40aRJFOA9SNxoyBhNjslW_7p8k",
  authDomain: "detective-board-b108b.firebaseapp.com",
  projectId: "detective-board-b108b",
  storageBucket: "detective-board-b108b.firebasestorage.app",
  messagingSenderId: "140107009046",
  appId: "1:140107009046:web:49e3c650ea0e90a5f2b937",
  measurementId: "G-TBJ91VEM4Y"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Habilitar persistencia sin conexión (Evita el error "client is offline")
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
      console.warn('Persistencia fallida: Múltiples pestañas abiertas.');
  } else if (err.code == 'unimplemented') {
      console.warn('Persistencia no soportada por el navegador.');
  }
});

export const googleProvider = new GoogleAuthProvider();
export { analytics };