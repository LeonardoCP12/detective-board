import { useCallback } from 'react';
import { db, storage } from '../firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

// Sube una imagen base64 a Firebase Storage y devuelve la URL de descarga.
// Si ya es una URL normal (http/https), la devuelve sin cambios.
const uploadImageToStorage = async (base64String, userId, boardId, nodeId) => {
  if (!base64String || !base64String.startsWith('data:image')) {
    return base64String; // Ya es una URL normal, no hay que subirla
  }

  try {
    // Ruta única en Storage para cada imagen de nodo
    const imagePath = `users/${userId}/boards/${boardId}/nodes/${nodeId}.jpg`;
    const imageRef = ref(storage, imagePath);

    // Subir el base64 directamente a Storage
    await uploadString(imageRef, base64String, 'data_url');

    // Obtener la URL pública de descarga
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error(`Error subiendo imagen del nodo ${nodeId}:`, error);
    // Si falla la subida, devolver null para no bloquear el guardado
    return null;
  }
};

// Procesa todos los nodos: sube las imágenes base64 a Storage y reemplaza con URLs
const processNodesImages = async (nodes, userId, boardId) => {
  const processedNodes = await Promise.all(
    nodes.map(async (node) => {
      // Solo los EvidenceNode tienen imágenes en data.image
      if (node.data?.image && node.data.image.startsWith('data:image')) {
        const imageUrl = await uploadImageToStorage(
          node.data.image,
          userId,
          boardId,
          node.id
        );
        return {
          ...node,
          data: {
            ...node.data,
            image: imageUrl, // Reemplazar base64 con URL de Storage
          },
        };
      }
      return node;
    })
  );
  return processedNodes;
};

const useFirestore = () => {
  const { currentUser } = useAuth();

  // Guardar un tablero
  const saveBoard = useCallback(async (boardId, boardData) => {
    if (!currentUser || !boardId) return;
    try {
      console.log(`[NUBE] ☁️ Intentando guardar tablero ${boardId}...`);

      // 1. Procesar nodos: subir imágenes base64 a Storage antes de guardar
      const processedNodes = await processNodesImages(
        boardData.nodes || [],
        currentUser.uid,
        boardId
      );

      // 2. Construir el objeto final sin base64 (Firestore lo acepta)
      const cleanBoardData = {
        ...boardData,
        nodes: processedNodes,
      };

      // 3. Limpiar undefined/null con JSON.parse para evitar errores de Firestore
      const cleanData = JSON.parse(JSON.stringify(cleanBoardData));

      const boardRef = doc(db, 'users', currentUser.uid, 'boards', boardId);
      await setDoc(boardRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
        ownerId: currentUser.uid,
      }, { merge: true });

      console.log(`[NUBE] ✅ Guardado exitoso.`);
    } catch (e) {
      console.error("❌ ERROR CRÍTICO al guardar en Firestore:", e);
      throw e;
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
      throw e;
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
      throw e;
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