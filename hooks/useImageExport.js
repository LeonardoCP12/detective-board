// c:\Users\User\Desktop\Tablero\hooks\useImageExport.js
import { useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { getNodesBounds } from 'reactflow';

const useImageExport = ({ reactFlowWrapper, reactFlowInstance, boards, currentBoardId, bgType, isDarkMode, setNodes }) => {
  const [isExporting, setIsExporting] = useState(false);

  const onExport = useCallback(async () => {
    if (reactFlowWrapper.current === null || !reactFlowInstance || !setNodes) return;
    
    setIsExporting(true);
    // Esperar un momento para que se renderice el overlay de carga
    await new Promise(resolve => setTimeout(resolve, 100));

    // 1. Guardar estado actual del viewport
    const { x, y, zoom } = reactFlowInstance.getViewport();

    // 2. Calcular los límites de todos los nodos
    const allNodes = reactFlowInstance.getNodes();
    const selectedNodes = allNodes.filter(n => n.selected);
    const selectedNodeIds = selectedNodes.map(n => n.id);

    // Deseleccionar temporalmente para que no salgan los bordes en la foto
    if (selectedNodeIds.length > 0) {
        setNodes(nds => nds.map(n => ({ ...n, selected: false })));
        // Esperar un ciclo de renderizado para que se apliquen los cambios
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const nodesToExport = selectedNodes.length > 0 ? selectedNodes : allNodes;

    if (nodesToExport.length === 0) {
        setIsExporting(false);
        // Restaurar selección si no hay nada que exportar
        if (selectedNodeIds.length > 0) setNodes(nds => nds.map(n => ({ ...n, selected: selectedNodeIds.includes(n.id) })));
        return;
    }
    
    const nodesBounds = getNodesBounds(nodesToExport);
    
    // 3. Definir dimensiones de la imagen
    const padding = 100;
    const imageWidth = nodesBounds.width + (padding * 2);
    const imageHeight = nodesBounds.height + (padding * 2);
    
    // 4. Mover viewport para encuadrar todo
    const transformX = -nodesBounds.x + padding;
    const transformY = -nodesBounds.y + padding;
    const transformZoom = 1;

    reactFlowInstance.setViewport({ x: transformX, y: transformY, zoom: transformZoom });

    // Esperar repintado
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (document.fonts) {
        await document.fonts.ready;
    }
    
    const flowElement = reactFlowWrapper.current.querySelector('.react-flow');
    if (!flowElement) {
        setIsExporting(false);
        // Restaurar selección si el elemento no se encuentra
        if (selectedNodeIds.length > 0) setNodes(nds => nds.map(n => ({ ...n, selected: selectedNodeIds.includes(n.id) })));
        return;
    }

    // Crear y añadir marca de agua temporal
    const currentBoard = boards.find(b => b.id === currentBoardId);
    const boardName = currentBoard ? currentBoard.name : 'Tablero sin nombre';
    const watermarkText = boardName.toUpperCase();

    // Calcular tamaño de fuente y márgenes dinámicamente basado en el ancho de la imagen
    const dynamicFontSize = Math.max(16, Math.min(72, imageWidth * 0.04));
    const margin = dynamicFontSize * 0.5;

    // Definir estilos de fondo para exportación
    let exportBgStyle = {};
    if (bgType === 'cork') {
        exportBgStyle = {
            backgroundColor: isDarkMode ? '#18181b' : '#e5e5e5',
            backgroundImage: isDarkMode 
                ? 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)'
                : 'radial-gradient(#999 1px, transparent 1px), radial-gradient(#999 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
        };
    } else if (bgType === 'blackboard') {
        exportBgStyle = {
            backgroundColor: isDarkMode ? '#27272a' : '#ffffff',
            backgroundImage: isDarkMode
                ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)'
                : 'radial-gradient(#e5e7eb 2px, transparent 2px)',
            backgroundSize: isDarkMode ? '100px 100px' : '30px 30px'
        };
    } else {
        exportBgStyle = {
            backgroundColor: isDarkMode ? '#1e293b' : '#f0f9ff',
            backgroundImage: isDarkMode
                ? 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)'
                : 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        };
    }

    const options = {
      pixelRatio: 2,
      skipAutoScale: true,
      backgroundColor: exportBgStyle.backgroundColor,
      width: imageWidth,
      height: imageHeight,
      style: {
         width: `${imageWidth}px`,
         height: `${imageHeight}px`,
         overflow: 'visible',
         fontFamily: "'Courier Prime', monospace",
         ...exportBgStyle,
      },
      imagePlaceholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      filter: (node) => {
        if (node.classList && (node.classList.contains('react-flow__controls') || node.classList.contains('react-flow__minimap') || node.classList.contains('react-flow__attribution'))) {
          return false;
        }
        return true;
      }
    };

    try {
      let dataUrl;
      try {
        // Intentar primero con CORS habilitado para capturar imágenes externas
        dataUrl = await toPng(flowElement, { ...options, useCORS: true });
      } catch (corsError) {
        console.warn('Error exportando con CORS, reintentando sin CORS...', corsError);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para estabilizar red
        // Si falla (ej: imágenes bloqueadas), reintentar sin CORS (las imágenes externas podrían no salir)
        dataUrl = await toPng(flowElement, { ...options, useCORS: false });
      }

      // --- Dibujar marca de agua directamente sobre el canvas ---
      const canvas = document.createElement('canvas');
      const pixelRatio = options.pixelRatio || 1;
      canvas.width = imageWidth * pixelRatio;
      canvas.height = imageHeight * pixelRatio;
      const ctx = canvas.getContext('2d');

      // Dibujar imagen base
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });
      ctx.drawImage(img, 0, 0);

      // Configurar texto de la marca de agua
      const scaledFontSize = dynamicFontSize * pixelRatio;
      ctx.font = `bold ${scaledFontSize}px "Courier Prime", monospace`;
      ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
      ctx.shadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 3 * pixelRatio;
      ctx.shadowOffsetX = 1 * pixelRatio;
      ctx.shadowOffsetY = 1 * pixelRatio;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      const scaledMargin = margin * pixelRatio;
      ctx.fillText(watermarkText, canvas.width - scaledMargin, canvas.height - scaledMargin);

      // Obtener la URL final con la marca de agua
      dataUrl = canvas.toDataURL('image/png');
      // ---------------------------------------------------------

      const link = document.createElement('a');
      const currentBoard = boards.find(b => b.id === currentBoardId);
      const fileName = currentBoard ? currentBoard.name.replace(/[^a-z0-9\u00C0-\u017F\s-_]/gi, '') : 'caso-detective';
      
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al exportar', err);
      alert('Error al generar la imagen. Si utilizas imágenes externas (URL), es posible que tengan restricciones de seguridad (CORS).');
    } finally {
      reactFlowInstance.setViewport({ x, y, zoom });
      // Restaurar la selección original
      if (selectedNodeIds.length > 0) {
        setNodes(nds => nds.map(n => ({ ...n, selected: selectedNodeIds.includes(n.id) })));
      }
      setIsExporting(false);
    }
  }, [reactFlowWrapper, isDarkMode, reactFlowInstance, boards, currentBoardId, bgType, setNodes]);

  return { isExporting, onExport };
};

export default useImageExport;
