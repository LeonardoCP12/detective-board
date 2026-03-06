// c:\Users\User\Desktop\Tablero\utils\storageUtils.js
const DEFAULT_BOARD_ID = 'default-case';

// Elimina propiedades internas de ReactFlow Y strip base64 de imágenes.
// localStorage tiene ~5MB de límite — un solo base64 puede llenarlo.
// Las imágenes se guardan en Firebase Storage; en localStorage solo guardamos
// la URL o null para no perder la referencia.
const sanitizeNodeForStorage = (node) => {
  const image = node.data?.image;
  // Si la imagen ya es una URL de Firebase Storage (https://...), la conservamos.
  // Si es base64 (data:image/...), la descartamos — se volverá a cargar desde Firestore.
  const safeImage = image && image.startsWith('http') ? image : null;

  return {
    id: node.id,
    type: node.type,
    position: node.position,
    data: { ...node.data, image: safeImage },
    width: node.width ?? null,
    height: node.height ?? null,
    style: node.style ?? null,
    selected: false,
    draggable: node.draggable ?? null,
    zIndex: node.zIndex ?? null,
  };
};

const sanitizeEdgeForStorage = (edge) => ({
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

// Guarda nodos en localStorage de forma segura (sin base64, sin internals de ReactFlow)
export const saveNodesToStorage = (boardId, nodes) => {
  try {
    const clean = (nodes || []).map(sanitizeNodeForStorage);
    localStorage.setItem(`board-${boardId}-nodes`, JSON.stringify(clean));
  } catch (e) {
    console.warn('No se pudo guardar nodos en localStorage:', e.message);
  }
};

// Guarda edges en localStorage de forma segura
export const saveEdgesToStorage = (boardId, edges) => {
  try {
    const clean = (edges || []).map(sanitizeEdgeForStorage);
    localStorage.setItem(`board-${boardId}-edges`, JSON.stringify(clean));
  } catch (e) {
    console.warn('No se pudo guardar edges en localStorage:', e.message);
  }
};

export const getBoardData = (boardId, initialNodes = []) => {
  let n = localStorage.getItem(`board-${boardId}-nodes`);
  let e = localStorage.getItem(`board-${boardId}-edges`);
  let bg = localStorage.getItem(`board-${boardId}-bg`);

  // Fallback a formato antiguo si es el default y no hay nuevo
  if (!n && boardId === DEFAULT_BOARD_ID) {
    n = localStorage.getItem('detective-board-nodes');
    e = localStorage.getItem('detective-board-edges');
  }

  return {
    nodes: n ? JSON.parse(n) : initialNodes,
    edges: e ? JSON.parse(e) : [],
    bgType: bg || 'cork',
  };
};