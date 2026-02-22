// c:\Users\User\Desktop\Tablero\hooks\useSearchSystem.js
import { useEffect, useCallback } from 'react';

const useSearchSystem = ({ searchTerm, setNodes, reactFlowInstance }) => {
  
  // Efecto para filtrar nodos según la búsqueda y hacer Zoom automático
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (!searchTerm) {
          return { ...node, style: { ...node.style, opacity: 1 } };
        }
        const label = node.data.label?.toLowerCase() || '';
        const desc = node.data.description?.toLowerCase() || '';
        const match = label.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
        
        return {
          ...node,
          style: { ...node.style, opacity: match ? 1 : 0.1 },
        };
      })
    );

    // Auto-zoom al primer resultado encontrado si hay búsqueda
    if (searchTerm && searchTerm.length > 1 && reactFlowInstance) {
      const allNodes = reactFlowInstance.getNodes();
      const firstMatch = allNodes.find((n) => {
        const label = n.data.label?.toLowerCase() || '';
        const desc = n.data.description?.toLowerCase() || '';
        return label.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
      });

      if (firstMatch) {
        // Centrar la vista en el nodo encontrado con una animación suave
        reactFlowInstance.setCenter(firstMatch.position.x + (firstMatch.width || 0) / 2, firstMatch.position.y + (firstMatch.height || 0) / 2, { zoom: 1.5, duration: 800 });
      }
    }
  }, [searchTerm, setNodes, reactFlowInstance]);

  const navigateSearch = useCallback((direction) => {
    if (!searchTerm || !reactFlowInstance) return;
    
    const allNodes = reactFlowInstance.getNodes();
    // Filtrar nodos que coinciden
    const matches = allNodes.filter((n) => {
        const label = n.data.label?.toLowerCase() || '';
        const desc = n.data.description?.toLowerCase() || '';
        return label.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
    });

    if (matches.length === 0) return;

    // Encontrar el nodo actualmente centrado o seleccionado para empezar desde ahí
    const currentMatchIndex = matches.findIndex(n => n.selected);
    let nextIndex = direction === 'next' ? currentMatchIndex + 1 : currentMatchIndex - 1;

    if (nextIndex >= matches.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = matches.length - 1;

    const targetNode = matches[nextIndex];
    setNodes(nds => nds.map(n => ({ ...n, selected: n.id === targetNode.id }))); // Seleccionar
    
    // Centrar la vista en el nodo (con fallback de tamaño si aún no se ha renderizado)
    const width = targetNode.width || 150;
    const height = targetNode.height || 50;
    
    reactFlowInstance.setCenter(targetNode.position.x + width / 2, targetNode.position.y + height / 2, { zoom: 1.5, duration: 600 });
  }, [searchTerm, reactFlowInstance, setNodes]);

  return { navigateSearch };
};

export default useSearchSystem;