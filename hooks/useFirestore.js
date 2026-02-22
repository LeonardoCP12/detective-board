import { useCallback } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const useFirestore = () => {
  const { currentUser } = useAuth();

  // Guardar un tablero
  const saveBoard = useCallback(async (boardId, boardData) => {
    if (!currentUser || !boardId) return;
    try {
      console.log(`[NUBE] ☁️ Intentando guardar tablero ${boardId}...`);
      const boardRef = doc(db, 'users', currentUser.uid, 'boards', boardId);
      // Convertir a objeto plano para evitar errores de "undefined" en Firestore
      const cleanData = JSON.parse(JSON.stringify(boardData));
      await setDoc(boardRef, { 
        ...cleanData, 
        updatedAt: serverTimestamp(),
        ownerId: currentUser.uid 
      }, { merge: true });
      console.log(`[NUBE] ✅ Guardado exitoso. Deberías ver la colección 'users' -> '${currentUser.uid}' en Firestore.`);
    } catch (e) {
      console.error("❌ ERROR CRÍTICO al guardar en Firestore (Revisa Reglas o Conexión):", e);
    }
  }, [currentUser]);

  // Cargar un tablero específico
  const loadBoard = useCallback(async (boardId) => {
    if (!currentUser || !boardId) return null;
    try {
      console.log(`[NUBE] Descargando tablero ${boardId}...`);
      const boardRef = doc(db, 'users', currentUser.uid, 'boards', boardId);
      const docSnap = await getDoc(boardRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (e) {
      console.error("Error al cargar de Firestore:", e);
      throw e; // IMPORTANTE: Lanzar error para detener el auto-guardado en App.jsx
    }
  }, [currentUser]);

  // Obtener lista de todos los tableros
  const getBoards = useCallback(async () => {
      if (!currentUser) return [];
      try {
          console.log(`[NUBE] Sincronizando lista de casos...`);
          const boardsRef = collection(db, 'users', currentUser.uid, 'boards');
          const q = query(boardsRef);
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
          console.error("Error al obtener tableros:", e);
          throw e; // IMPORTANTE: Lanzar error para saber que falló la conexión
      }
  }, [currentUser]);

  // Eliminar un tablero
  const deleteBoard = useCallback(async (boardId) => {
      if (!currentUser) return;
      await deleteDoc(doc(db, 'users', currentUser.uid, 'boards', boardId));
  }, [currentUser]);

  return { saveBoard, loadBoard, getBoards, deleteBoard };
};

export default useFirestore;