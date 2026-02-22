// c:\Users\User\Desktop\Tablero\hooks\useGraphOperations.js
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const useGraphOperations = ({
  reactFlowInstance,
  setNodes,
  setEdges,
  takeSnapshot,
  animateAndRemoveNode,
  animateAndRemoveEdge,
  setEditModalOpen,
  setEditingNode,
  setEditingEdge,
  setInputModalOpen,
  setConnectionColor,
  setConnectionLineType,
  setPendingStampNodeId
}) => {

  const handleSaveNode = useCallback((nodeId, newData) => {
    takeSnapshot();
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: newData } : node));
  }, [setNodes, takeSnapshot]);

  const handleDeleteNode = useCallback((nodeId) => {
    takeSnapshot();
    animateAndRemoveNode(nodeId);
    setEditModalOpen(false);
    setEditingNode(null);
  }, [animateAndRemoveNode, takeSnapshot, setEditModalOpen, setEditingNode]);

  const duplicateSelected = useCallback(() => {
    if (!reactFlowInstance) return;
    const selectedNodes = reactFlowInstance.getNodes().filter((n) => n.selected);
    if (selectedNodes.length > 0) {
      takeSnapshot();
      const idMap = new Map();
      const newNodes = selectedNodes.map((node) => {
        const newId = uuidv4();
        idMap.set(node.id, newId);
        return { ...node, id: newId, position: { x: node.position.x + 50, y: node.position.y + 50 }, selected: true, data: { ...node.data } };
      });
      const internalEdges = reactFlowInstance.getEdges().filter(e => idMap.has(e.source) && idMap.has(e.target));
      const newEdges = internalEdges.map(e => ({ ...e, id: uuidv4(), source: idMap.get(e.source), target: idMap.get(e.target), selected: true }));
      setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes));
      setEdges(eds => eds.map(e => ({ ...e, selected: false })).concat(newEdges));
    }
  }, [reactFlowInstance, setNodes, setEdges, takeSnapshot]);

  const handleConnectionColorChange = useCallback((newColor) => {
    setConnectionColor(newColor);
    setEdges((eds) => eds.map((e) => e.selected ? { ...e, style: { ...e.style, stroke: newColor } } : e));
  }, [setEdges, setConnectionColor]);

  const handleConnectionLineTypeChange = useCallback((newType) => {
    setConnectionLineType(newType);
    setEdges((eds) => eds.map((e) => e.selected ? { ...e, type: newType } : e));
  }, [setEdges, setConnectionLineType]);

  const handleEdgeLabelSave = useCallback((text, newColor, newType, editingEdge) => {
    if (editingEdge) {
      takeSnapshot();
      setEdges((eds) => eds.map((e) => e.id === editingEdge.id ? { ...e, label: text, type: newType || e.type, style: { ...e.style, stroke: newColor }, labelStyle: undefined, labelBgStyle: undefined } : e));
      setEditingEdge(null);
    }
  }, [setEdges, takeSnapshot, setEditingEdge]);

  const handleEdgeDelete = useCallback((editingEdge, editingNode) => {
    if (editingEdge) {
      takeSnapshot();
      animateAndRemoveEdge(editingEdge.id);
      setEditingEdge(null);
      setInputModalOpen(false);
    } else if (editingNode && editingNode.type === 'zone') {
      handleDeleteNode(editingNode.id);
      setInputModalOpen(false);
    }
  }, [animateAndRemoveEdge, handleDeleteNode, takeSnapshot, setEditingEdge, setInputModalOpen]);

  const handleInputModalConfirm = useCallback((text, color, type, editingEdge, editingNode, pendingStampNodeId) => {
    if (editingEdge) {
      handleEdgeLabelSave(text, color, type, editingEdge);
    } else if (editingNode && editingNode.type === 'zone') {
      takeSnapshot();
      setNodes(nds => nds.map(n => n.id === editingNode.id ? { ...n, data: { ...n.data, label: text }, style: { ...n.style, borderColor: color, backgroundColor: `${color}10` } } : n));
      setEditingNode(null);
      setInputModalOpen(false);
    } else if (pendingStampNodeId) {
      takeSnapshot();
      setNodes((nds) => nds.map((n) => n.id === pendingStampNodeId ? { ...n, data: { ...n.data, status: { type: 'custom', label: text || 'SELLO', color: color } } } : n));
      setPendingStampNodeId(null);
      setInputModalOpen(false);
    }
  }, [handleEdgeLabelSave, setNodes, takeSnapshot, setEditingNode, setInputModalOpen, setPendingStampNodeId]);

  return {
    handleSaveNode,
    handleDeleteNode,
    duplicateSelected,
    handleConnectionColorChange,
    handleConnectionLineTypeChange,
    handleEdgeLabelSave,
    handleEdgeDelete,
    handleInputModalConfirm
  };
};

export default useGraphOperations;