import React, { useState, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './index.css';

import Sidebar from './components/Sidebar';
import EditModal from './components/EditModal';
import ContextMenu from './components/ContextMenu';
import ConfirmModal from './components/ConfirmModal';
import HelpModal from './components/HelpModal';
import InputModal from './components/InputModal';
import CaseManager from './components/CaseManager';
import Toolbar from './components/Toolbar';
import useAutoSave from './hooks/useAutoSave';
import useClipboard from './hooks/useClipboard';
import useImageExport from './hooks/useImageExport';
import useBoardManagement from './hooks/useBoardManagement';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useDragDrop from './hooks/useDragDrop';
import useFlowConfiguration, { ThemeContext } from './hooks/useFlowConfiguration';
import useNodeLifecycle from './hooks/useNodeLifecycle';
import useFlowInteractions from './hooks/useFlowInteractions';
import useFileOperations from './hooks/useFileOperations';
import useSearchSystem from './hooks/useSearchSystem';
import useEditorSettings from './hooks/useEditorSettings';
import useGraphOperations from './hooks/useGraphOperations';
import { getBoardData } from './utils/storageUtils';
import { useAuth } from './AuthContext';
import AuthPage from './AuthPage';
import useFirestore from './useFirestore';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

const Board = () => {
  const reactFlowWrapper = useRef(null);

  // --- EFECTO PARA TÍTULO Y FAVICON ---
  useEffect(() => {
    document.title = 'Detective Board';
    const faviconUrl = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23dc2626%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2211%22%20cy%3D%2211%22%20r%3D%228%22%3E%3C%2Fcircle%3E%3Cline%20x1%3D%2221%22%20y1%3D%2221%22%20x2%3D%2216.65%22%20y2%3D%2216.65%22%3E%3C%2Fline%3E%3C%2Fsvg%3E';
    
    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconUrl;
  }, []);
  
  // --- GESTIÓN DE TABLEROS (CASOS) ---
  const [caseManagerOpen, setCaseManagerOpen] = useState(false);
  
  // Estado temporal para inicializar ReactFlow (se gestionará dentro de useBoardManagement)
  // const currentBoardIdRef = useRef(localStorage.getItem('detective-current-board-id') || 'default-case');
  // AHORA USAMOS FIRESTORE, INICIALIZAMOS VACÍO

  // Inicializar estado de ReactFlow con el tablero actual
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [menu, setMenu] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [editingEdge, setEditingEdge] = useState(null);
  const [pendingStampNodeId, setPendingStampNodeId] = useState(null);
  
  // --- FIRESTORE HOOK ---
  const { saveBoard, loadBoard } = useFirestore();

  // --- CONFIGURACIÓN DEL EDITOR (HOOK) ---
  const {
    connectionColor, setConnectionColor,
    connectionLineType, setConnectionLineType,
    isInteractive, setIsInteractive,
    isDarkMode, setIsDarkMode,
    searchTerm, setSearchTerm,
    isSidebarOpen, setIsSidebarOpen,
    isZenMode, setIsZenMode,
    bgType, setBgType,
    toggleBackground
  } = useEditorSettings('cork'); // Valor por defecto

  // --- CONFIGURACIÓN DE FLUJO (HOOK) ---
  const { nodeTypes, edgeTypes, proOptions, connectionLineStyle, nodeColor } = useFlowConfiguration({ isDarkMode, connectionColor });

  // --- CICLO DE VIDA DE NODOS (HOOK) ---
  const { takeSnapshot, undo, redo, clearHistory, onNodesChangeWithHistory, onEdgesChangeWithHistory, animateAndRemoveNode, animateAndRemoveEdge } = useNodeLifecycle({ nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange });

  // --- GESTIÓN DE TABLEROS (HOOK) ---
  const {
    boards,
    setBoards,
    trash,
    currentBoardId,
    setCurrentBoardId,
    handleSwitchBoard,
    handleCreateBoard,
    handleDeleteBoard,
    handleRestoreBoard,
    handlePermanentDelete,
    handleRenameBoard,
    handleReorderBoards,
    handleCloneBoard
  } = useBoardManagement({ nodes, edges, bgType, setNodes, setEdges, setBgType, reactFlowInstance, clearHistory, setCaseManagerOpen, setConfirmModal, lastSaved });

  // --- PERSISTENCIA Y SEGURIDAD ---
  // useAutoSave({ nodes, edges, bgType, currentBoardId, setLastSaved }); 
  // REEMPLAZADO POR FIRESTORE AUTO-SAVE

  // Efecto para cargar datos iniciales desde Firestore
  useEffect(() => {
    const fetchBoard = async () => {
      if (currentBoardId) {
        const data = await loadBoard(currentBoardId);
        if (data) {
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          if (data.bgType) setBgType(data.bgType);
        }
      }
    };
    fetchBoard();
  }, [currentBoardId, loadBoard, setNodes, setEdges, setBgType]);

  // Efecto para guardar automáticamente en Firestore (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentBoardId && (nodes.length > 0 || edges.length > 0)) {
        saveBoard(currentBoardId, {
          nodes,
          edges,
          bgType,
          name: boards.find(b => b.id === currentBoardId)?.name || 'Caso Sin Nombre'
        });
        setLastSaved(new Date());
      }
    }, 2000); // Guardar cada 2 segundos de inactividad
    return () => clearTimeout(timer);
  }, [nodes, edges, bgType, currentBoardId, saveBoard, boards]);

  // Confirmación al cerrar la pestaña
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Estándar para mostrar el diálogo del navegador
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Hook para pegar imágenes (Ctrl+V)
  useClipboard({ isInteractive, reactFlowInstance, takeSnapshot, setNodes });

  // --- INTERACCIONES DE FLUJO (HOOK) ---
  const {
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
  } = useFlowInteractions({
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
  });

  // Salir del modo Zen con Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isZenMode) setIsZenMode(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isZenMode]);

  // --- OPERACIONES DE GRAFO (HOOK) ---
  const {
    handleSaveNode,
    handleDeleteNode,
    duplicateSelected,
    handleConnectionColorChange,
    handleConnectionLineTypeChange,
    handleEdgeDelete,
    handleInputModalConfirm
  } = useGraphOperations({
    reactFlowInstance, setNodes, setEdges, takeSnapshot, animateAndRemoveNode, animateAndRemoveEdge,
    setEditModalOpen, setEditingNode, setEditingEdge, setInputModalOpen, setConnectionColor, setConnectionLineType, setPendingStampNodeId
  });

  // --- DRAG & DROP (HOOK) ---
  const { onDragOver, onDrop } = useDragDrop({
    isInteractive,
    reactFlowInstance,
    setNodes,
    takeSnapshot,
    setPendingStampNodeId,
    setInputModalOpen,
    setEditingEdge,
    setEditingNode
  });

  // --- OPERACIONES DE ARCHIVO (HOOK) ---
  const { onSave, onLoad, onClear } = useFileOperations({
    reactFlowInstance,
    boards,
    currentBoardId,
    bgType,
    setBoards,
    setNodes,
    setEdges,
    setBgType,
    handleSwitchBoard,
    clearHistory,
    takeSnapshot,
    setConfirmModal
  });

  // --- SISTEMA DE BÚSQUEDA (HOOK) ---
  const { navigateSearch } = useSearchSystem({ searchTerm, setNodes, reactFlowInstance });

  // --- ATAJO DE TECLADO: BLOQUEAR/DESBLOQUEAR (Ctrl + L) ---
  const toggleLockSelected = React.useCallback(() => {
    takeSnapshot();
    setNodes((nds) => {
      const selected = nds.filter((n) => n.selected);
      if (selected.length === 0) return nds;
      // Si al menos uno está desbloqueado, bloqueamos todos. Si todos están bloqueados, desbloqueamos.
      const shouldLock = selected.some((n) => !n.data.locked);
      return nds.map((n) => n.selected ? { ...n, data: { ...n.data, locked: shouldLock }, draggable: !shouldLock } : n);
    });
  }, [setNodes, takeSnapshot]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLockSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLockSelected]);

  // Efecto para animar conexiones cuando se selecciona un nodo
  useEffect(() => {
    // 1. Identificar nodos seleccionados
    const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);

    // 2. Actualizar hilos conectados
    setEdges((eds) => {
      let hasChanges = false;
      const newEdges = eds.map((edge) => {
        const isConnected = selectedNodeIds.includes(edge.source) || selectedNodeIds.includes(edge.target);
        const hasClass = edge.className?.includes('animated-flow');

        if (isConnected && !hasClass) {
          hasChanges = true;
          // Eliminar 'quick-draw' si existe para evitar conflictos de velocidad en la animación
          const baseClass = (edge.className || '').replace('quick-draw', '').trim();
          return { ...edge, className: `${baseClass} animated-flow`.trim() };
        } else if (!isConnected && hasClass) {
          hasChanges = true;
          return { ...edge, className: (edge.className || '').replace('animated-flow', '').trim() };
        }
        return edge;
      });
      return hasChanges ? newEdges : eds;
    });
  }, [nodes, setEdges]);

  // Efecto de limpieza: Eliminar la clase 'quick-draw' después de la animación
  // Esto asegura que todos los hilos tengan la misma velocidad de animación base después de ser creados
  useEffect(() => {
    const hasQuickDraw = edges.some(e => e.className?.includes('quick-draw'));
    if (hasQuickDraw) {
      const timer = setTimeout(() => {
        setEdges(eds => eds.map(e => 
          e.className?.includes('quick-draw') 
            ? { ...e, className: e.className.replace('quick-draw', '').trim() } 
            : e
        ));
      }, 1000); // Esperar a que termine la animación rápida (0.8s)
      return () => clearTimeout(timer);
    }
  }, [edges, setEdges]);

  // Hook para Exportar a Imagen
  const { isExporting, onExport } = useImageExport({ reactFlowWrapper, reactFlowInstance, boards, currentBoardId, bgType, isDarkMode, setNodes });

  // --- ATAJOS DE TECLADO (HOOK) ---
  useKeyboardShortcuts({ onSave, undo, redo, duplicateSelected, navigateSearch, reactFlowInstance, edges, setEdges, takeSnapshot, connectionLineType, connectionColor });

  const currentBoard = boards.find(b => b.id === currentBoardId);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <div className={`flex h-screen w-screen transition-colors duration-500 ease-in-out ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50 light-mode'}`}>
      <ThemeContext.Provider value={isDarkMode}>
      <ReactFlowProvider>
        {!isZenMode && <Sidebar 
          connectionColor={connectionColor} 
          setConnectionColor={handleConnectionColorChange} 
          connectionLineType={connectionLineType}
          setConnectionLineType={handleConnectionLineTypeChange}
          lastSaved={lastSaved}
          onSave={onSave}
          onLoad={onLoad}
          onClear={onClear}
          onHelp={() => setHelpModalOpen(true)}
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onExport={onExport}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenCaseManager={() => setCaseManagerOpen(true)}
          currentBoardName={currentBoard?.name}
          onToggleZen={() => setIsZenMode(true)}
          onNextMatch={() => navigateSearch('next')}
          onPrevMatch={() => navigateSearch('prev')}
          onToggleBg={toggleBackground}
          onLogout={handleLogout}
        />}
        
        <div 
          className="flex-grow h-full relative overflow-hidden" 
          ref={reactFlowWrapper} 
          style={{ "--connection-color": connectionColor }}
          onPointerDown={handleRightPointerDown}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Toolbar isZenMode={isZenMode} setIsZenMode={setIsZenMode} undo={undo} redo={redo} isDarkMode={isDarkMode} />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWithHistory}
            onEdgesChange={onEdgesChangeWithHistory}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeClick={onEdgeClick}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className={`${bgType === 'cork' ? 'cork-pattern' : bgType === 'blackboard' ? 'blackboard-pattern' : 'graph-paper-pattern'} ${!isInteractive ? 'board-locked' : ''} ${isDarkMode ? '' : 'light-mode'}`}
            connectionLineType={connectionLineType}
            connectionLineStyle={connectionLineStyle}
            nodesDraggable={isInteractive}
            proOptions={proOptions}
            elevateNodesOnSelect={false} // Desactivar elevación automática para que las zonas no tapen el contenido
            nodesConnectable={isInteractive}
            elementsSelectable={isInteractive}
            panOnDrag={isInteractive}
            zoomOnScroll={isInteractive}
            zoomOnPinch={isInteractive}
            panOnScroll={isInteractive}
            zoomOnDoubleClick={isInteractive}
            onNodeDragStart={onNodeDragStart}
            onMoveStart={onMoveStart}
            onMoveEnd={onMoveEnd}
            connectionRadius={30}
          >
            {!isZenMode && <Controls 
              showInteractive={true} 
              onInteractiveChange={setIsInteractive} 
              fitViewOptions={{ duration: 800, padding: 0.2 }} 
              style={{ left: isSidebarOpen ? '340px' : '10px', transition: 'left 0.2s ease-in-out' }}
            />}
            {!isZenMode && <MiniMap 
                nodeColor={nodeColor} 
                maskColor={isDarkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.1)"}
                className={isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-gray-200 shadow-md"}
            />}
            <Background gap={20} size={1} color={isDarkMode ? "#444" : "#aaa"} variant="dots" className="opacity-20" />
            {menu && <ContextMenu onClick={onPaneClick} {...menu} onHide={() => setMenu(null)} takeSnapshot={takeSnapshot} setNodes={setNodes} />}
            
            {/* Indicador de Tablero Vacío */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none">
                <div className={`text-center ${isDarkMode ? 'opacity-10' : 'opacity-20'}`}>
                  <h1 className="text-5xl md:text-7xl font-black text-zinc-500 font-mono mb-4 tracking-[0.2em] uppercase">CONFIDENCIAL</h1>
                  <p className="text-sm text-zinc-500 font-mono uppercase tracking-widest">Arrastra evidencia o haz doble clic</p>
                </div>
              </div>
            )}

            {/* Filtros SVG para efectos realistas */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none' }}>
              <defs>
                {/* Filtro para simular textura de hilo/lana */}
                <filter id="yarn-texture" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                </filter>
              </defs>
            </svg>
          </ReactFlow>

          {/* Vignette Overlay - Efecto Cine/Noir */}
          <div className="absolute inset-0 pointer-events-none z-[5] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
          
          {/* Loading Overlay for Export */}
          {isExporting && (
            <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 cursor-wait">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-bold text-white font-mono tracking-widest animate-pulse">REVELANDO EVIDENCIA...</h2>
              <p className="text-zinc-400 text-xs font-mono mt-2">Procesando fotografía del tablero completo.</p>
            </div>
          )}

          {/* Custom Selection Box */}
          {selectionRect && selectionRect.isDragging && (
            <div 
                className="absolute z-50 pointer-events-none"
                style={{
                    left: `${selectionRect.x}px`,
                    top: `${selectionRect.y}px`,
                    width: `${selectionRect.width}px`,
                    height: `${selectionRect.height}px`,
                    border: '2px dashed #3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }}
            />
          )}
        </div>

        <EditModal 
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          node={editingNode}
          onSave={handleSaveNode}
          onDelete={handleDeleteNode}
          isDarkMode={isDarkMode}
        />
        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          isDanger={confirmModal.isDanger}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          isDarkMode={isDarkMode}
        />
        <HelpModal 
          isOpen={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
          isDarkMode={isDarkMode}
        />
        <InputModal
          isOpen={inputModalOpen}
          onClose={() => { setInputModalOpen(false); setEditingEdge(null); setEditingNode(null); setPendingStampNodeId(null); }}
          onConfirm={(text, color, type) => handleInputModalConfirm(text, color, type, editingEdge, editingNode, pendingStampNodeId)}
          onDelete={() => {
            if (pendingStampNodeId) {
              takeSnapshot();
              setNodes((nds) => nds.map((n) => {
                if (n.id === pendingStampNodeId) {
                  return { ...n, data: { ...n.data, status: null } };
                }
                return n;
              }));
              setInputModalOpen(false);
              setPendingStampNodeId(null);
            } else {
              handleEdgeDelete(editingEdge, editingNode);
            }
          }}
          title={editingEdge ? "EDITAR CONEXIÓN" : (pendingStampNodeId ? "CREAR SELLO" : "EDITAR ZONA")}
          initialValue={editingEdge ? (editingEdge.label || '') : (pendingStampNodeId ? '' : (editingNode?.data?.label || ''))}
          initialColor={editingEdge ? (editingEdge.style?.stroke || '#dc2626') : (pendingStampNodeId ? '#dc2626' : (editingNode?.style?.borderColor || '#71717a'))}
          initialType={editingEdge?.type}
          showTypeSelector={!!editingEdge}
          colorLabel={editingEdge ? "Color del Hilo" : (pendingStampNodeId ? "Color del Sello" : "Color de Zona")}
          placeholder={pendingStampNodeId ? "Texto del sello (ej: CONFIRMADO)" : "Escribe una etiqueta..."}
          isDarkMode={isDarkMode}
        />
        <CaseManager 
          isOpen={caseManagerOpen}
          onClose={() => setCaseManagerOpen(false)}
          boards={boards}
          currentBoardId={currentBoardId}
          onSwitch={handleSwitchBoard}
          onCreate={handleCreateBoard}
          onDelete={handleDeleteBoard}
          onRename={handleRenameBoard}
          onClone={handleCloneBoard}
          onReorder={handleReorderBoards}
          trash={trash}
          onRestore={handleRestoreBoard}
          onPermanentDelete={handlePermanentDelete}
          isDarkMode={isDarkMode}
        />
      </ReactFlowProvider>
      </ThemeContext.Provider>
    </div>
  );
};

const App = () => {
  const { currentUser } = useAuth();

  // Si hay un usuario logueado, muestra el tablero.
  // Si no, muestra la página de autenticación.
  return currentUser ? <Board /> : <AuthPage />;
}

export default App;