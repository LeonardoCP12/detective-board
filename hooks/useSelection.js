import { useState, useRef, useCallback } from 'react';

const useSelection = (reactFlowWrapper, reactFlowInstance, isInteractive, onPaneContextMenu, setNodes) => {
  const [selectionRect, setSelectionRect] = useState(null);
  const selectionDragRef = useRef(null);

  const handleRightPointerDown = useCallback((e) => {
    if (e.button !== 2) return;
    if (!isInteractive) return;
    
    // Evitar conflicto si clicamos en un nodo, hilo o control
    if (e.target.closest('.react-flow__node') || e.target.closest('.react-flow__edge') || e.target.closest('.react-flow__controls') || e.target.closest('.react-flow__minimap')) return;

    e.preventDefault();

    const { left, top } = reactFlowWrapper.current.getBoundingClientRect();
    const startX = e.clientX - left;
    const startY = e.clientY - top;

    // Inicializar ref de arrastre
    selectionDragRef.current = {
        startX, startY, x: startX, y: startY, width: 0, height: 0, isDragging: false
    };

    // Funciones internas para manejar el ciclo de vida del arrastre globalmente
    const handleWindowPointerMove = (ev) => {
        // FAILSAFE: Si no hay botones presionados, cancelar inmediatamente
        if (ev.buttons === 0) {
            handleWindowPointerUp(ev);
            return;
        }

        if (!selectionDragRef.current || !reactFlowWrapper.current) return;
        
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const currentX = ev.clientX - rect.left;
        const currentY = ev.clientY - rect.top;
        
        const x = Math.min(selectionDragRef.current.startX, currentX);
        const y = Math.min(selectionDragRef.current.startY, currentY);
        const width = Math.abs(currentX - selectionDragRef.current.startX);
        const height = Math.abs(currentY - selectionDragRef.current.startY);
        
        // Solo actualizar si realmente estamos arrastrando (más de 5px)
        if (width > 5 || height > 5) {
            selectionDragRef.current = {
                ...selectionDragRef.current,
                x, y, width, height,
                isDragging: true
            };
            setSelectionRect({...selectionDragRef.current});
        }
    };

    const handleWindowPointerUp = (ev) => {
        // Limpiar listeners globales
        window.removeEventListener('pointermove', handleWindowPointerMove);
        window.removeEventListener('pointerup', handleWindowPointerUp);
        window.removeEventListener('pointercancel', handleWindowPointerUp);
        
        const wasDragging = selectionDragRef.current?.isDragging;
        const rectState = selectionDragRef.current;
        
        // Limpiar estado
        selectionDragRef.current = null;
        setSelectionRect(null);

        if (!wasDragging) {
             onPaneContextMenu(ev);
        } else if (rectState && reactFlowInstance) {
             // --- LÓGICA DE SELECCIÓN ---
             const flowBounds = reactFlowWrapper.current.getBoundingClientRect();
             
             const p1 = reactFlowInstance.screenToFlowPosition({ 
                 x: flowBounds.left + rectState.x, 
                 y: flowBounds.top + rectState.y 
             });
             const p2 = reactFlowInstance.screenToFlowPosition({ 
                 x: flowBounds.left + rectState.x + rectState.width, 
                 y: flowBounds.top + rectState.y + rectState.height 
             });

             const selectionRectFlow = {
                 x: Math.min(p1.x, p2.x),
                 y: Math.min(p1.y, p2.y),
                 width: Math.abs(p2.x - p1.x),
                 height: Math.abs(p2.y - p1.y),
             };

             // Filtrar nodos que intersectan con el rectángulo
             const nodesToSelect = reactFlowInstance.getNodes().filter((n) => {
                 const nWidth = n.width ?? n.measured?.width ?? 200;
                 const nHeight = n.height ?? n.measured?.height ?? 150;
                 const absX = n.positionAbsolute?.x ?? n.position.x;
                 const absY = n.positionAbsolute?.y ?? n.position.y;

                 return (
                     selectionRectFlow.x < absX + nWidth &&
                     selectionRectFlow.x + selectionRectFlow.width > absX &&
                     selectionRectFlow.y < absY + nHeight &&
                     selectionRectFlow.y + selectionRectFlow.height > absY
                 );
             });

             // Actualizar selección
             setNodes((nds) => nds.map((n) => ({
                 ...n,
                 selected: nodesToSelect.some((sn) => sn.id === n.id) || (ev.shiftKey && n.selected),
             })));
        }
    };

    // Añadir listeners a window
    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);
  }, [isInteractive, onPaneContextMenu, reactFlowInstance, setNodes, reactFlowWrapper]);

  return { selectionRect, handleRightPointerDown };
};

export default useSelection;
