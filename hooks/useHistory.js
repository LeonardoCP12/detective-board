import { useState, useCallback } from 'react';

const useHistory = (nodes, edges, setNodes, setEdges) => {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const takeSnapshot = useCallback(() => {
    setPast((p) => [...p, { nodes, edges }]);
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture((f) => [{ nodes, edges }, ...f]);
    setPast(newPast);
    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast((p) => [...p, { nodes, edges }]);
    setFuture(newFuture);
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [future, nodes, edges, setNodes, setEdges]);

  const clearHistory = useCallback(() => {
      setPast([]);
      setFuture([]);
  }, []);

  return { takeSnapshot, undo, redo, clearHistory, canUndo: past.length > 0, canRedo: future.length > 0 };
};

export default useHistory;
