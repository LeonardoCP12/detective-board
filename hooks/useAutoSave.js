import { saveNodesToStorage, saveEdgesToStorage } from '../utils/storageUtils';
// c:\Users\User\Desktop\Tablero\hooks\useAutoSave.js
import { useEffect } from 'react';

const useAutoSave = ({ nodes, edges, bgType, currentBoardId, setLastSaved }) => {
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        saveNodesToStorage(currentBoardId, nodes);
        saveEdgesToStorage(currentBoardId, edges);
        localStorage.setItem(`board-${currentBoardId}-bg`, bgType);
        setLastSaved(new Date());
      } catch (e) {
        // console.error("Error guardando en localStorage:", e);
      }
    }, 1000); // Espera 1 segundo de inactividad antes de guardar

    return () => clearTimeout(saveTimeout);
  }, [nodes, edges, bgType, currentBoardId, setLastSaved]);
};

export default useAutoSave;