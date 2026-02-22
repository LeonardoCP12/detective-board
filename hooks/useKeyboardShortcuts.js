// c:\Users\User\Desktop\Tablero\hooks\useKeyboardShortcuts.js
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const useKeyboardShortcuts = ({
  onSave,
  undo,
  redo,
  duplicateSelected,
  navigateSearch,
  reactFlowInstance,
  edges,
  setEdges,
  takeSnapshot,
  connectionLineType,
  connectionColor
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
      }
      if (e.key === 'F3') {
        e.preventDefault();
        if (e.shiftKey) {
          navigateSearch('prev');
        } else {
          navigateSearch('next');
        }
      }
      // Conexión Rápida (Shift + C)
      if (e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (!reactFlowInstance) return;
        const selectedNodes = reactFlowInstance.getNodes().filter((n) => n.selected);
        if (selectedNodes.length >= 2) {
            // Ordenar visualmente de izquierda a derecha para crear una secuencia lógica
            selectedNodes.sort((a, b) => a.position.x - b.position.x);
            
            const newEdges = [];
            for (let i = 0; i < selectedNodes.length - 1; i++) {
                const source = selectedNodes[i];
                const target = selectedNodes[i+1];
                
                // Evitar duplicados
                const exists = edges.some(edge => 
                    (edge.source === source.id && edge.target === target.id) || 
                    (edge.source === target.id && edge.target === source.id)
                );

                if (!exists) {
                    newEdges.push({ 
                      id: uuidv4(), 
                      source: source.id, 
                      target: target.id, 
                      type: connectionLineType, 
                      style: { stroke: connectionColor, strokeWidth: 2 },
                      className: 'quick-draw'
                    });
                }
            }

            if (newEdges.length > 0) {
                takeSnapshot();
                setEdges((eds) => eds.concat(newEdges));
            }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, undo, redo, duplicateSelected, navigateSearch, edges, connectionLineType, connectionColor, reactFlowInstance, setEdges, takeSnapshot]);
};

export default useKeyboardShortcuts;
