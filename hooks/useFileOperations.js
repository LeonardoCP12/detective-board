// c:\Users\User\Desktop\Tablero\hooks\useFileOperations.js
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const useFileOperations = ({
  reactFlowInstance,
  boards,
  currentBoardId,
  bgType,
  setBoards,
  setNodes,
  setEdges,
  setBgType,
  handleSwitchBoard,
  clearHistory,
  takeSnapshot,
  setConfirmModal
}) => {

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const exportData = { ...flow, bgType };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const currentBoard = boards.find(b => b.id === currentBoardId);
      const fileName = currentBoard ? currentBoard.name.replace(/[^a-z0-9\u00C0-\u017F\s-_]/gi, '') : 'caso-detective';
      
      link.download = `${fileName}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [reactFlowInstance, boards, currentBoardId, bgType]);

  const onLoad = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.replace(/\.json$/i, '');
    const fileReader = new FileReader();
    
    fileReader.onload = (e) => {
      try {
        const flow = JSON.parse(e.target.result);
        if (flow && (flow.nodes || flow.edges)) {
          const nodesData = flow.nodes || [];
          const edgesData = flow.edges || [];
          const bg = flow.bgType || 'cork';
          
          const existingBoard = boards.find(b => b.name === fileName);

          if (existingBoard) {
            setConfirmModal({
              isOpen: true,
              title: '¿SOBRESCRIBIR CASO?',
              message: `Ya existe un caso llamado "${fileName}". ¿Deseas sobrescribir sus datos con este archivo?`,
              confirmText: 'Sobrescribir',
              cancelText: 'Cancelar',
              isDanger: true,
              onConfirm: () => {
                localStorage.setItem(`board-${existingBoard.id}-nodes`, JSON.stringify(nodesData));
                localStorage.setItem(`board-${existingBoard.id}-edges`, JSON.stringify(edgesData));
                localStorage.setItem(`board-${existingBoard.id}-bg`, bg);

                if (existingBoard.id === currentBoardId) {
                  setNodes(nodesData);
                  setEdges(edgesData);
                  setBgType(bg);
                  clearHistory();
                } else {
                  handleSwitchBoard(existingBoard.id);
                }
              }
            });
          } else {
            const newId = uuidv4();
            const newBoard = { id: newId, name: fileName, createdAt: Date.now(), lastModified: Date.now() };
            
            localStorage.setItem(`board-${newId}-nodes`, JSON.stringify(nodesData));
            localStorage.setItem(`board-${newId}-edges`, JSON.stringify(edgesData));
            localStorage.setItem(`board-${newId}-bg`, bg);
            
            setBoards(prev => [...prev, newBoard]);
            handleSwitchBoard(newId);
          }
        }
      } catch (error) {
        console.error("Error al cargar el caso", error);
        alert("El archivo no es válido.");
      }
    };
    fileReader.readAsText(file);
    event.target.value = '';
  }, [boards, currentBoardId, setNodes, setEdges, setBgType, handleSwitchBoard, setBoards, setConfirmModal, clearHistory]);

  const onClear = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: '¿LIMPIAR TABLERO?',
      message: '¿Estás seguro de que quieres eliminar todo el contenido del tablero? Esta acción no se puede deshacer.',
      onConfirm: () => {
        takeSnapshot();
        setNodes([]);
        setEdges([]);
      },
      isDanger: true
    });
  }, [takeSnapshot, setNodes, setEdges, setConfirmModal]);

  return { onSave, onLoad, onClear };
};

export default useFileOperations;