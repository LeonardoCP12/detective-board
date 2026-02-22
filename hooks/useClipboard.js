// c:\Users\User\Desktop\Tablero\hooks\useClipboard.js
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { processImage } from '../utils/imageUtils';

const useClipboard = ({ isInteractive, reactFlowInstance, takeSnapshot, setNodes }) => {
  useEffect(() => {
    const handlePaste = (e) => {
      if (!isInteractive || !reactFlowInstance) return;
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          processImage(blob, (compressedImage, width, height) => {
              // Pegar en el centro de la pantalla actual
              const position = reactFlowInstance.screenToFlowPosition({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
              });
              const newNode = {
                id: uuidv4(),
                type: 'image',
                position,
                data: { label: 'Imagen Pegada', image: compressedImage },
                style: { width, height },
              };
              takeSnapshot();
              setNodes((nds) => nds.concat(newNode));
          });
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [reactFlowInstance, isInteractive, takeSnapshot, setNodes]);
};

export default useClipboard;
