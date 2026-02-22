// c:\Users\User\Desktop\Tablero\hooks\useFlowInteractions.js
import { useCallback } from 'react';
import { addEdge } from 'reactflow';
import useSelection from './useSelection';

const useFlowInteractions = ({
  isInteractive,
  reactFlowInstance,
  reactFlowWrapper,
  setEdges,
  setNodes,
  connectionLineType,
  connectionColor,
  takeSnapshot,
  setEditingNode,
  setEditingEdge,
  setInputModalOpen,
  setEditModalOpen,
  setMenu
}) => {
  
  const onConnect = useCallback(
    (params) => {
      takeSnapshot();
      setEdges((eds) => addEdge({ ...params, type: connectionLineType, style: { stroke: connectionColor, strokeWidth: 2 } }, eds));
    },
    [setEdges, connectionColor, takeSnapshot, connectionLineType],
  );

  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isInteractive) return;
    setEditingNode(null);
    setEditingEdge(edge);
    setInputModalOpen(true);
  }, [isInteractive, setEditingNode, setEditingEdge, setInputModalOpen]);

  const onEdgeClick = useCallback((event, edge) => {
    if (!isInteractive) return;
    takeSnapshot();
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === edge.id) {
          const isDashed = e.style?.strokeDasharray;
          return {
            ...e,
            style: { ...e.style, strokeDasharray: isDashed ? undefined : '10,10' },
          };
        }
        return e;
      })
    );
  }, [setEdges, isInteractive, takeSnapshot]);

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const onPaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      if (!isInteractive) return;

      const pane = reactFlowWrapper.current.getBoundingClientRect();
      setMenu({
        top: event.clientY < pane.bottom - 200 ? event.clientY - pane.top : undefined,
        left: event.clientX < pane.right - 200 ? event.clientX - pane.left : undefined,
        right: event.clientX >= pane.right - 200 ? pane.width - (event.clientX - pane.left) : undefined,
        bottom: event.clientY >= pane.bottom - 200 ? pane.height - (event.clientY - pane.top) : undefined,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    },
    [isInteractive, reactFlowWrapper, setMenu],
  );

  const { selectionRect, handleRightPointerDown } = useSelection(
    reactFlowWrapper, 
    reactFlowInstance, 
    isInteractive, 
    onPaneContextMenu, 
    setNodes
  );

  const onNodeDoubleClick = useCallback((event, node) => {
    if (node.type === 'evidence') {
      setEditingNode(node);
      setEditModalOpen(true);
    } else if (node.type === 'zone') {
      setEditingEdge(null);
      setEditingNode(node);
      setInputModalOpen(true);
    }
  }, [setEditingNode, setEditModalOpen, setEditingEdge, setInputModalOpen]);

  const onNodeDragStart = useCallback((event, node) => {
    takeSnapshot();
    if (node.type !== 'zone') {
      setNodes((nds) => {
        const idx = nds.findIndex((n) => n.id === node.id);
        if (idx === nds.length - 1) return nds;
        
        const newNodes = [...nds];
        const [movedNode] = newNodes.splice(idx, 1);
        newNodes.push(movedNode);
        return newNodes;
      });
    }
  }, [takeSnapshot, setNodes]);

  const onMoveStart = useCallback(() => {
    if (reactFlowWrapper.current) {
        reactFlowWrapper.current.classList.add('is-moving');
    }
  }, [reactFlowWrapper]);

  const onMoveEnd = useCallback(() => {
    if (reactFlowWrapper.current) {
        reactFlowWrapper.current.classList.remove('is-moving');
    }
  }, [reactFlowWrapper]);

  return {
    onConnect,
    onEdgeContextMenu,
    onEdgeClick,
    onPaneClick,
    onPaneContextMenu,
    onNodeDoubleClick,
    onNodeDragStart,
    onMoveStart,
    onMoveEnd,
    selectionRect,
    handleRightPointerDown
  };
};

export default useFlowInteractions;