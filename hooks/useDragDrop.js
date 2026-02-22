// c:\Users\User\Desktop\Tablero\hooks\useDragDrop.js
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { processImage } from '../utils/imageUtils';

const useDragDrop = ({
  isInteractive,
  reactFlowInstance,
  setNodes,
  takeSnapshot,
  setPendingStampNodeId,
  setInputModalOpen,
  setEditingEdge,
  setEditingNode
}) => {
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    if (!isInteractive) {
      event.dataTransfer.dropEffect = 'none';
      return;
    }
    event.dataTransfer.dropEffect = 'move';
  }, [isInteractive]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!isInteractive) return;

      // Lógica para soltar archivos de imagen desde el escritorio
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        processImage(file, (compressedImage, width, height) => {
              const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
              const newNode = {
                id: uuidv4(),
                type: 'image',
                position,
                data: { label: 'Imagen', image: compressedImage },
                style: { width, height },
              };
              takeSnapshot();
              setNodes((nds) => nds.concat(newNode));
        });
        return;
      }

      // Lógica para soltar imágenes arrastradas desde el navegador (o desde otros nodos)
      const draggedImageUrl = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
      if (draggedImageUrl && (draggedImageUrl.startsWith('data:image') || draggedImageUrl.startsWith('http'))) {
          const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
          const newNode = {
            id: uuidv4(),
            type: 'image',
            position,
            data: { label: 'Imagen Extraída', image: draggedImageUrl },
            style: { width: 300, height: 300 },
          };
          takeSnapshot();
          setNodes((nds) => nds.concat(newNode));
          return;
      }

      const type = event.dataTransfer.getData('application/reactflow');
      const category = event.dataTransfer.getData('application/category');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Lógica para Sellos (Stamps)
      if (type === 'stamp') {
        const status = event.dataTransfer.getData('application/category'); // Usamos category para el status
        const isCustom = status === 'custom';

        // Usamos la API de ReactFlow para detectar intersecciones
        const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const intersectingNodes = reactFlowInstance.getIntersectingNodes({
            x: position.x,
            y: position.y,
            width: 1,
            height: 1,
        });

        // Filtramos por tipos válidos y tomamos el último
        const targetNode = intersectingNodes.slice().reverse().find(n => n.type === 'evidence' || n.type === 'note' || n.type === 'image');
        
        if (targetNode) {
          if (isCustom) {
            setPendingStampNodeId(targetNode.id);
            setInputModalOpen(true);
            setEditingEdge(null);
            setEditingNode(null);
            return;
          }

          takeSnapshot();
          setNodes((nds) => nds.map((n) => {
            if (n.id === targetNode.id) {
              return { ...n, data: { ...n.data, status } };
            }
            return n;
          }));
        }
        return;
      }

      // Lógica para Zonas
      if (type === 'zone') {
        const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newNode = {
          id: uuidv4(),
          type: 'zone',
          position,
          data: { label: 'ZONA SEGURA' },
          style: { width: 300, height: 300, backgroundColor: 'rgba(113, 113, 122, 0.05)', borderColor: '#71717a' },
        };
        takeSnapshot();
        setNodes((nds) => [newNode, ...nds]); // Añadir al principio para que quede al fondo
        return;
      }

      // Lógica para URL
      if (type === 'url') {
        const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newNode = {
          id: uuidv4(),
          type: 'url',
          position,
          data: { url: '', label: 'Nuevo Enlace' },
          style: { width: 300, height: 250 },
        };
        takeSnapshot();
        setNodes((nds) => nds.concat(newNode));
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: uuidv4(),
        type,
        position,
        data: { 
            label: `Nuevo ${category}`, 
            category,
            description: 'Doble click para editar...' 
        },
      };

      takeSnapshot();
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, isInteractive, takeSnapshot, setPendingStampNodeId, setInputModalOpen, setEditingEdge, setEditingNode],
  );

  return { onDragOver, onDrop };
};

export default useDragDrop;
