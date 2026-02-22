// c:\Users\User\Desktop\Tablero\hooks\useBoardManagement.js
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getBoardData } from '../utils/storageUtils';

const DEFAULT_BOARD_ID = 'default-case';

const useBoardManagement = ({
  nodes,
  edges,
  bgType,
  setNodes,
  setEdges,
  setBgType,
  reactFlowInstance,
  clearHistory,
  setCaseManagerOpen,
  setConfirmModal,
  lastSaved
}) => {
  const [boards, setBoards] = useState(() => {
    try {
      const saved = localStorage.getItem('detective-boards-list');
      if (saved) return JSON.parse(saved);
      
      const legacyNodes = localStorage.getItem('detective-board-nodes');
      if (legacyNodes) {
          return [{ id: DEFAULT_BOARD_ID, name: 'Caso #001: Principal', createdAt: Date.now(), lastModified: Date.now() }];
      }
      
      return [{ id: DEFAULT_BOARD_ID, name: 'Caso #001: Nuevo', createdAt: Date.now(), lastModified: Date.now() }];
    } catch (e) {
      return [{ id: DEFAULT_BOARD_ID, name: 'Caso #001: Nuevo', createdAt: Date.now(), lastModified: Date.now() }];
    }
  });

  const [trash, setTrash] = useState(() => {
    try {
      const saved = localStorage.getItem('detective-boards-trash');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [currentBoardId, setCurrentBoardId] = useState(() => {
      return localStorage.getItem('detective-current-board-id') || DEFAULT_BOARD_ID;
  });

  // Persistencia
  useEffect(() => {
      localStorage.setItem('detective-boards-list', JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
      localStorage.setItem('detective-boards-trash', JSON.stringify(trash));
  }, [trash]);

  useEffect(() => {
      localStorage.setItem('detective-current-board-id', currentBoardId);
  }, [currentBoardId]);

  // Actualizar fecha de modificación
  useEffect(() => {
    if (lastSaved) {
        setBoards(prevBoards => 
            prevBoards.map(board => 
                board.id === currentBoardId 
                    ? { ...board, lastModified: lastSaved.getTime() } 
                    : board
            )
        );
    }
  }, [lastSaved, currentBoardId]);

  // Título Dinámico
  useEffect(() => {
    const currentBoard = boards.find(b => b.id === currentBoardId);
    if (currentBoard) {
      document.title = `${currentBoard.name} | Detective Board`;
    }
  }, [currentBoardId, boards]);

  // Cambiar Tablero
  const handleSwitchBoard = useCallback((boardId) => {
      // Guardar estado actual
      localStorage.setItem(`board-${currentBoardId}-nodes`, JSON.stringify(nodes));
      localStorage.setItem(`board-${currentBoardId}-edges`, JSON.stringify(edges));
      localStorage.setItem(`board-${currentBoardId}-bg`, bgType);

      // Cargar nuevo estado
      const data = getBoardData(boardId);
      setNodes(data.nodes);
      setEdges(data.edges);
      setBgType(data.bgType);
      setCurrentBoardId(boardId);
      clearHistory();
      setCaseManagerOpen(false);

      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ duration: 800, padding: 0.2 });
        }, 100);
      }
  }, [currentBoardId, nodes, edges, bgType, setNodes, setEdges, setBgType, clearHistory, reactFlowInstance, setCaseManagerOpen]);

  // Crear Tablero
  const handleCreateBoard = (name) => {
      if (!name) return;
      const newId = uuidv4();
      const newBoard = { 
          id: newId, 
          name: name, 
          createdAt: Date.now(),
          lastModified: Date.now()
      };
      setBoards(prev => [...prev, newBoard]);
      handleSwitchBoard(newId);
  };

  // Borrar Tablero (Mover a papelera)
  const handleDeleteBoard = (boardId) => {
      if (boards.length <= 1) return;
      
      setConfirmModal({
          isOpen: true,
          title: '¿MOVER A PAPELERA?',
          message: 'El caso se moverá a la papelera. Podrás restaurarlo si lo necesitas.',
          isDanger: true,
          confirmText: 'Mover',
          onConfirm: () => {
              setBoards(prev => prev.map(b => b.id === boardId ? { ...b, isDeleting: true } : b));

              setTimeout(() => {
                  const boardToDelete = boards.find(b => b.id === boardId);
                  const newBoards = boards.filter(b => b.id !== boardId);
                  
                  if (boardToDelete) {
                      const { isDeleting, ...cleanBoard } = boardToDelete;
                      setTrash(prev => [{ ...cleanBoard, deletedAt: Date.now() }, ...prev]);
                  }

                  setBoards(newBoards);

                  if (currentBoardId === boardId) {
                      const nextBoardId = newBoards[0].id;
                      const data = getBoardData(nextBoardId);
                      setNodes(data.nodes);
                      setEdges(data.edges);
                      setBgType(data.bgType);
                      setCurrentBoardId(nextBoardId);
                      clearHistory();
                      if (reactFlowInstance) {
                        setTimeout(() => {
                          reactFlowInstance.fitView({ duration: 800, padding: 0.2 });
                        }, 100);
                      }
                  }
              }, 500);
          }
      });
  };

  const handleRestoreBoard = useCallback((boardId) => {
      const boardToRestore = trash.find(b => b.id === boardId);
      if (!boardToRestore) return;

      setTrash(prev => prev.filter(b => b.id !== boardId));
      setBoards(prev => [...prev, { ...boardToRestore, isDeleting: false }]);
  }, [trash]);

  const handlePermanentDelete = useCallback((boardId) => {
      setConfirmModal({
          isOpen: true,
          title: '¿ELIMINAR DEFINITIVAMENTE?',
          message: 'Esta acción es irreversible. Los datos del caso se borrarán del disco para siempre.',
          isDanger: true,
          confirmText: 'Eliminar',
          onConfirm: () => {
              setTrash(prev => prev.filter(b => b.id !== boardId));
              localStorage.removeItem(`board-${boardId}-nodes`);
              localStorage.removeItem(`board-${boardId}-edges`);
              localStorage.removeItem(`board-${boardId}-bg`);
          }
      });
  }, []);

  const handleRenameBoard = (boardId, newName) => {
      setBoards(prev => prev.map(b => b.id === boardId ? { ...b, name: newName } : b));
  };

  const handleReorderBoards = useCallback((newBoards) => {
      setBoards(newBoards);
  }, []);

  const handleCloneBoard = useCallback((boardIdToClone) => {
    const boardToClone = boards.find(b => b.id === boardIdToClone);
    if (!boardToClone) return;

    setConfirmModal({
        isOpen: true,
        title: '¿CLONAR CASO?',
        message: `¿Deseas crear una copia del expediente "${boardToClone.name}"?`,
        confirmText: 'Clonar',
        onConfirm: () => {
            let nodesData, edgesData, bgData;
            
            if (boardIdToClone === currentBoardId) {
                nodesData = nodes;
                edgesData = edges;
                bgData = bgType;
            } else {
                const data = getBoardData(boardIdToClone);
                nodesData = data.nodes;
                edgesData = data.edges;
                bgData = data.bgType;
            }

            const newId = uuidv4();
            const newBoard = {
              id: newId,
              name: `${boardToClone.name} (Copia)`,
              createdAt: Date.now(),
              lastModified: Date.now(),
            };

            localStorage.setItem(`board-${newId}-nodes`, JSON.stringify(nodesData));
            localStorage.setItem(`board-${newId}-edges`, JSON.stringify(edgesData));
            localStorage.setItem(`board-${newId}-bg`, bgData);

            setBoards(prev => {
                const index = prev.findIndex(b => b.id === boardIdToClone);
                const newBoards = [...prev];
                newBoards.splice(index + 1, 0, newBoard);
                return newBoards;
            });

            handleSwitchBoard(newId);
        }
    });
  }, [boards, handleSwitchBoard, currentBoardId, nodes, edges, bgType, setConfirmModal]);

  // Chequeo de seguridad
  useEffect(() => {
    if (boards.length > 0 && !boards.find(b => b.id === currentBoardId)) {
        handleSwitchBoard(boards[0].id);
    }
  }, [boards, currentBoardId, handleSwitchBoard]);

  return {
    boards,
    setBoards,
    trash,
    currentBoardId,
    setCurrentBoardId,
    handleSwitchBoard,
    handleCreateBoard,
    handleDeleteBoard,
    handleRestoreBoard,
    handlePermanentDelete,
    handleRenameBoard,
    handleReorderBoards,
    handleCloneBoard
  };
};

export default useBoardManagement;
