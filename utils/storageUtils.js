// c:\Users\User\Desktop\Tablero\utils\storageUtils.js
const DEFAULT_BOARD_ID = 'default-case';

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
      bgType: bg || 'cork'
  };
};