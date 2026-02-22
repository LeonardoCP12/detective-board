// c:\Users\User\Desktop\Tablero\hooks\useNodeLifecycle.js
import { useCallback } from 'react';
import useHistory from './useHistory';

const useNodeLifecycle = ({ nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange }) => {
  const { takeSnapshot, undo, redo, clearHistory } = useHistory(nodes, edges, setNodes, setEdges);

  const animateAndRemoveNode = useCallback((nodeId) => {
    setNodes((prevNodes) => {
      const node = prevNodes.find((n) => n.id === nodeId);
      if (!node) return prevNodes;
      if (node.data?.isDeleting) return prevNodes;

      setTimeout(() => {
        setNodes((nds) => {
            const n = nds.find(x => x.id === nodeId);
            if (n && n.data?.isDeleting) {
                return nds.filter((x) => x.id !== nodeId);
            }
            return nds;
        });
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      }, 500);

      return prevNodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, isDeleting: true } } : n));
    });
  }, [setNodes, setEdges]);

  const animateAndRemoveEdge = useCallback((edgeId) => {
    setEdges((prevEdges) => {
      const edge = prevEdges.find((e) => e.id === edgeId);
      if (!edge) return prevEdges;
      if (edge.className?.includes('deleting-edge')) return prevEdges;

      setTimeout(() => {
        setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      }, 300);

      return prevEdges.map((e) => (e.id === edgeId ? { ...e, className: `${e.className || ''} deleting-edge` } : e));
    });
  }, [setEdges]);

  const onNodesChangeWithHistory = useCallback((changes) => {
    const changesToApply = changes.filter(c => c.type !== 'remove');
    const nodesToRemove = changes.filter(c => c.type === 'remove');

    if (nodesToRemove.length > 0) {
        takeSnapshot();
        nodesToRemove.forEach(c => animateAndRemoveNode(c.id));
    }
    if (changesToApply.length > 0) onNodesChange(changesToApply);
  }, [onNodesChange, takeSnapshot, animateAndRemoveNode]);

  const onEdgesChangeWithHistory = useCallback((changes) => {
    const changesToApply = changes.filter(c => c.type !== 'remove');
    const edgesToRemove = changes.filter(c => c.type === 'remove');

    if (edgesToRemove.length > 0) {
        takeSnapshot();
        edgesToRemove.forEach(c => animateAndRemoveEdge(c.id));
    }
    if (changesToApply.length > 0) onEdgesChange(changesToApply);
  }, [onEdgesChange, takeSnapshot, animateAndRemoveEdge]);

  return {
    takeSnapshot,
    undo,
    redo,
    clearHistory,
    onNodesChangeWithHistory,
    onEdgesChangeWithHistory,
    animateAndRemoveNode,
    animateAndRemoveEdge
  };
};

export default useNodeLifecycle;