import { useCallback } from 'react';
import { db, storage } from '../firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

// ─── Sanitizar nodos: elimina internals de ReactFlow ─────────────────────────
const sanitizeNode = (node) => ({
  id: node.id,
  type: node.type,
  position: node.position,
  data: node.data,
  width: node.width ?? null,
  height: node.height ?? null,
  style: node.style ?? null,
  selected: false,
  draggable: node.draggable ?? null,
  zIndex: node.zIndex ?? null,
});

const sanitizeEdge = (edge) => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle ?? null,
  targetHandle: edge.targetHandle ?? null,
  type: edge.type ?? null,
  label: edge.label ?? null,
  style: edge.style ?? null,
  data: edge.data ?? null,
  animated: edge.animated ?? null,
});

// ─── Subir imagen a Firebase Storage ─────────────────────────────────────────
const uploadImageToStorage = async (base64String, userId, boardId, nodeId) => {
  if (!base64String || !base64String.startsWith('data:image')) {
    return base64String; // Ya es URL normal, no hacer nada
  }

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Upload timeout')), 20000)
  );

  const upload = async () => {
    const imagePath = `users/${userId}/boards/${boardId}/nodes/${nodeId}.jpg`;
    const imageRef = ref(storage, imagePath);
    await uploadString(imageRef, base64String, 'data_url');
    return await getDownloadURL(imageRef);
  };

  try {
    const url = await Promise.race([upload(), timeout]);
    console.log(`[STORAGE] ✅ Imagen subida para nodo ${nodeId}`);
    return url;
  } catch (error) {
    console.error(`[STORAGE] ❌ Error subiendo imagen del nodo ${nodeId}:`, error.message);
    return null;
  }
};

// ─── Procesar imagen de un nodo: subir si es base64, devolver URL ─────────────
// También maneja el caso donde ImageNode convirtió una URL de Storage a base64
// para exportación local. En ese caso también hay que volver a subir.
const processNodeImage = async (node, userId, boardId) => {
  const image = node.data?.image;
  if (!image) return node;

  // Si ya es URL de Firebase Storage, no hacer nada
  if (image.startsWith('https://firebasestorage.googleapis.com') ||
      image.startsWith('https://storage.googleapis.com')) {
    return node;
  }

  // Si es base64 (local o reconvertida desde URL), subir a Storage
  if (image.startsWith('data:image')) {
    const imageUrl = await uploadImageToStorage(image, userId, boardId, node.id);
    return { ...node, data: { ...node.data, image: imageUrl } };
  }

  // Cualquier otra URL (http externo), dejarla como está
  return node;
};

// ─────────────────────────────────────────────────────────────────────────────

const useFirestore = () => {
  const { currentUser } = useAuth();

  const saveBoard = useCallback(async (boardId, boardData) => {
    if (!currentUser || !boardId) return;
    try {
      console.log(`[NUBE] ☁️ Intentando guardar tablero ${boardId}...`);

      // 1. Eliminar propiedades internas de ReactFlow
      const sanitizedNodes = (boardData.nodes || []).map(sanitizeNode);
      const sanitizedEdges = (boardData.edges || []).map(sanitizeEdge);

      // 2. Procesar imágenes: subir base64 a Storage, conservar URLs de Storage
      const processedNodes = await Promise.all(
        sanitizedNodes.map((node) => processNodeImage(node, currentUser.uid, boardId))
      );

      // 3. JSON round-trip para eliminar undefined
      const cleanData = JSON.parse(JSON.stringify({
        ...boardData,
        nodes: processedNodes,
        edges: sanitizedEdges,
      }));

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

  const loadBoard = useCallback(async (boardId) => {
    if (!currentUser || !boardId) return null;
    try {
      console.log(`[NUBE] Descargando tablero ${boardId}...`);
      const boardRef = doc(db, 'users', currentUser.uid, 'boards', boardId);
      const docSnap = await getDoc(boardRef);
      if (docSnap.exists()) return docSnap.data();
      return null;
    } catch (e) {
      console.error("Error al cargar de Firestore:", e);
      throw e;
    }
  }, [currentUser]);

  const getBoards = useCallback(async () => {
    if (!currentUser) return [];
    try {
      console.log(`[NUBE] Sincronizando lista de casos...`);
      const boardsRef = collection(db, 'users', currentUser.uid, 'boards');
      const querySnapshot = await getDocs(query(boardsRef));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error al obtener tableros:", e);
      throw e;
    }
  }, [currentUser]);

  const deleteBoard = useCallback(async (boardId) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'boards', boardId));
  }, [currentUser]);

  return { saveBoard, loadBoard, getBoards, deleteBoard };
};

export default useFirestore;