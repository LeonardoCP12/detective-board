import { useCallback } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

// ─── Cloudinary config ────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'daebsaogp';
const CLOUDINARY_UPLOAD_PRESET = 'detective_board';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

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

// ─── Subir imagen a Cloudinary ────────────────────────────────────────────────
// Acepta base64 (imágenes locales) o URLs externas (https://...)
const uploadImageToCloudinary = async (image, nodeId) => {
  if (!image) return null;

  // Si ya es una URL de Cloudinary, no volver a subir
  if (image.includes('cloudinary.com')) {
    return image;
  }

  try {
    // console.log(`[CLOUDINARY] ⬆️ Subiendo imagen del nodo ${nodeId}...`);

    const formData = new FormData();
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('public_id', `detective-board/nodes/${nodeId}`);

    // Base64 (imagen local subida desde escritorio)
    if (image.startsWith('data:image')) {
      formData.append('file', image);
    }
    // URL externa (https://...)
    else if (image.startsWith('http')) {
      formData.append('file', image);
    }
    // No es imagen válida
    else {
      return image;
    }

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    // console.log(`[CLOUDINARY] ✅ Imagen subida: ${data.secure_url}`);
    return data.secure_url;

  } catch (error) {
    // console.error(`[CLOUDINARY] ❌ Error subiendo imagen del nodo ${nodeId}:`, error.message);
    return null;
  }
};

// ─── Procesar imagen de un nodo ───────────────────────────────────────────────
const processNodeImage = async (node) => {
  const image = node.data?.image;
  if (!image) return node;

  // Ya es URL de Cloudinary, no hacer nada
  if (image.includes('cloudinary.com')) return node;

  // Es base64 o URL externa → subir a Cloudinary
  if (image.startsWith('data:image') || image.startsWith('http')) {
    const imageUrl = await uploadImageToCloudinary(image, node.id);
    return { ...node, data: { ...node.data, image: imageUrl } };
  }

  return node;
};

// ─────────────────────────────────────────────────────────────────────────────

const useFirestore = () => {
  const { currentUser } = useAuth();

  const saveBoard = useCallback(async (boardId, boardData) => {
    if (!currentUser || !boardId) return;
    try {
      // console.log(`[NUBE] ☁️ Intentando guardar tablero ${boardId}...`);

      // 1. Eliminar propiedades internas de ReactFlow
      const sanitizedNodes = (boardData.nodes || []).map(sanitizeNode);
      const sanitizedEdges = (boardData.edges || []).map(sanitizeEdge);

      // 2. Subir imágenes a Cloudinary (base64 o URLs externas → URL de Cloudinary)
      const processedNodes = await Promise.all(
        sanitizedNodes.map((node) => processNodeImage(node))
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

      // console.log(`[NUBE] ✅ Guardado exitoso.`);
    } catch (e) {
      // console.error("❌ ERROR CRÍTICO al guardar en Firestore:", e);
      throw e;
    }
  }, [currentUser]);

  const loadBoard = useCallback(async (boardId) => {
    if (!currentUser || !boardId) return null;
    try {
      // console.log(`[NUBE] Descargando tablero ${boardId}...`);
      const boardRef = doc(db, 'users', currentUser.uid, 'boards', boardId);
      const docSnap = await getDoc(boardRef);
      if (docSnap.exists()) return docSnap.data();
      return null;
    } catch (e) {
      // console.error("Error al cargar de Firestore:", e);
      throw e;
    }
  }, [currentUser]);

  const getBoards = useCallback(async () => {
    if (!currentUser) return [];
    try {
      // console.log(`[NUBE] Sincronizando lista de casos...`);
      const boardsRef = collection(db, 'users', currentUser.uid, 'boards');
      const querySnapshot = await getDocs(query(boardsRef));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      // console.error("Error al obtener tableros:", e);
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