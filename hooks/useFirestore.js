import { useCallback } from 'react';
import { db, storage } from '../firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

// ─── Limpia propiedades internas que ReactFlow agrega en runtime ──────────────
// ReactFlow 11 agrega: internals (contiene Map), measured, positionAbsolute,
// handleBounds, resizing, dragging, etc. Firestore rechaza Map y estructuras
// circulares dentro de arrays, causando "Property array contains an invalid nested entity"
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

// ─── Sube imagen base64 a Firebase Storage y retorna URL ─────────────────────
const uploadImageToStorage = async (base64String, userId, boardId, nodeId) => {
  if (!base64String || !base64String.startsWith('data:image')) {
    return base64String; // Ya es URL normal, no hacer nada
  }
  try {
    const imagePath = `users/${userId}/boards/${boardId}/nodes/${nodeId}.jpg`;
    const imageRef = ref(storage, imagePath);
    await uploadString(imageRef, base64String, 'data_url');
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error(`Error subiendo imagen del nodo ${nodeId}:`, error);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const useFirestore = () => {
  const { currentUser } = useAuth();

  const saveBoard = useCallback(async (boardId, boardData) => {
    if (!currentUser || !boardId) return;
    try {
      console.log(`[NUBE] ☁️ Intentando guardar tablero ${boardId}...`);

      // 1. Eliminar propiedades internas de ReactFlow (Map, internals, measured, etc.)
      const sanitizedNodes = (boardData.nodes || []).map(sanitizeNode);
      const sanitizedEdges = (boardData.edges || []).map(sanitizeEdge);

      // 2. Subir imágenes base64 a Firebase Storage y reemplazar con URLs
      const processedNodes = await Promise.all(
        sanitizedNodes.map(async (node) => {
          if (node.data?.image && node.data.image.startsWith('data:image')) {
            const imageUrl = await uploadImageToStorage(node.data.image, currentUser.uid, boardId, node.id);
            return { ...node, data: { ...node.data, image: imageUrl } };
          }
          return node;
        })
      );

      // 3. JSON round-trip para eliminar cualquier undefined restante
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
      if (docSnap.exists()) {
        return docSnap.data();
      }
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
      const q = query(boardsRef);
      const querySnapshot = await getDocs(q);
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