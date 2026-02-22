import React, { useState, useMemo } from 'react';
import { Folder, Plus, Trash2, FileText, X, Check, Pencil, Copy, Search, ArrowUpDown, GripVertical, Recycle, RefreshCw } from 'lucide-react';

const CaseManager = ({ isOpen, onClose, boards, currentBoardId, onSwitch, onCreate, onDelete, onRename, onClone, onReorder, trash, onRestore, onPermanentDelete, isDarkMode }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('manual'); // manual, name, created, modified
  const [showTrash, setShowTrash] = useState(false);

  // Filtrado y Ordenación
  const displayBoards = useMemo(() => {
      const sourceList = showTrash ? trash : boards;
      let filtered = sourceList.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (sortBy === 'name') return filtered.sort((a, b) => a.name.localeCompare(b.name));
      if (sortBy === 'created') return filtered.sort((a, b) => b.createdAt - a.createdAt);
      if (sortBy === 'modified') return filtered.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
      
      return filtered;
  }, [boards, trash, searchTerm, sortBy, showTrash]);

  // Solo permitir arrastrar si no hay búsqueda activa y el orden es manual
  const isDraggable = sortBy === 'manual' && !searchTerm && !showTrash;

  const handleDragStart = (e, index) => {
      e.dataTransfer.setData('boardIndex', index);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
      e.preventDefault();
      const dragIndex = parseInt(e.dataTransfer.getData('boardIndex'));
      if (isNaN(dragIndex) || dragIndex === dropIndex) return;
      
      const newBoards = [...boards];
      const [moved] = newBoards.splice(dragIndex, 1);
      newBoards.splice(dropIndex, 0, moved);
      onReorder(newBoards);
  };

  if (!isOpen) return null;

  const handleStartEdit = (board) => {
    setEditingId(board.id);
    setEditName(board.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onRename(editingId, editName);
    }
    setEditingId(null);
  };

  const handleCreateSubmit = () => {
    if (newCaseName.trim()) {
      onCreate(newCaseName);
      setNewCaseName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'} border w-[900px] h-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-950' : 'border-gray-200 bg-gray-50'} flex justify-between items-center z-50 relative`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'} font-mono tracking-widest flex items-center gap-3 uppercase`}>
              {showTrash ? <Recycle className="text-red-500" size={28} /> : <Folder className="text-yellow-600" size={28} />}
              {showTrash ? 'PAPELERA DE RECICLAJE' : 'ARCHIVOS DE CASO'}
            </h2>
            <p className={`${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} text-xs font-mono mt-1`}>
                {showTrash ? 'Restaura casos eliminados o bórralos definitivamente' : 'Selecciona un expediente para investigar'}
            </p>
          </div>
          <button onClick={onClose} className={`${isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'} transition-colors`}>
            <X size={24} />
          </button>
        </div>

        {/* Barra de Herramientas (Búsqueda y Orden) */}
        <div className={`px-6 py-3 border-b flex gap-4 items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-200 bg-gray-50/50'}`}>
            <div className={`flex-1 flex items-center px-3 py-1.5 rounded border ${isDarkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-gray-300'}`}>
                <Search size={14} className={isDarkMode ? "text-zinc-500" : "text-gray-400"} />
                <input 
                    type="text" 
                    name="case-search"
                    placeholder="Buscar expediente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`ml-2 bg-transparent w-full text-xs outline-none font-mono ${isDarkMode ? 'text-zinc-300 placeholder-zinc-600' : 'text-zinc-700 placeholder-zinc-400'}`}
                />
            </div>
            
            <button onClick={() => setShowTrash(!showTrash)} className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-bold uppercase transition-colors ${showTrash ? (isDarkMode ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600') : (isDarkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white' : 'bg-white border-gray-300 text-gray-600 hover:text-black')}`}>
                {showTrash ? <Folder size={14} /> : <Recycle size={14} />}
                {showTrash ? 'Ver Archivos' : 'Papelera'}
            </button>

            <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className={isDarkMode ? "text-zinc-500" : "text-gray-400"} />
                <select 
                    name="sort-cases"
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`text-xs font-mono p-1.5 rounded border outline-none cursor-pointer ${isDarkMode ? 'bg-zinc-950 border-zinc-700 text-zinc-300' : 'bg-white border-gray-300 text-zinc-700'}`}
                >
                    <option value="manual">Manual (Arrastrar)</option>
                    <option value="name">Nombre (A-Z)</option>
                    <option value="created">Creado (Reciente)</option>
                    <option value="modified">Modificado (Reciente)</option>
                </select>
            </div>
        </div>

        {/* Content - Estilo Pila 3D */}
        <div className={`flex-1 p-8 overflow-y-auto overflow-x-hidden ${isDarkMode ? 'bg-zinc-900/50' : 'bg-gray-100'}`}>
          <div className="flex flex-wrap justify-center items-start gap-y-12 pl-8 pb-12 pt-[2px]">
            
            {/* New Case Button (Siempre al inicio) */}
            {!searchTerm && !showTrash && (isCreating ? (
                 <div className="relative w-56 h-40 -ml-12 first:ml-0 z-50 transition-all duration-300 shadow-2xl transform scale-105">
                    <div className={`flex flex-col items-center justify-center h-full border-2 border-dashed border-yellow-600/50 bg-yellow-900/10 rounded-lg p-4 animate-in zoom-in duration-200 ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                        <span className="text-yellow-500 font-mono text-xs font-bold mb-2">NOMBRE DEL CASO</span>
                        <input 
                            type="text" 
                            name="new-case-name"
                            autoFocus
                            value={newCaseName}
                            onChange={(e) => setNewCaseName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateSubmit();
                                if (e.key === 'Escape') setIsCreating(false);
                            }}
                            placeholder="Ej: El Robo del Siglo"
                            className={`${isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border text-xs p-2 w-full rounded outline-none focus:border-yellow-600 font-mono text-center mb-2`}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsCreating(false)} className={`${isDarkMode ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'} text-[10px] uppercase font-bold px-2 py-1 rounded`}>Cancelar</button>
                            <button onClick={handleCreateSubmit} className="text-zinc-900 bg-yellow-600 hover:bg-yellow-500 text-[10px] uppercase font-bold px-3 py-1 rounded">Crear</button>
                        </div>
                    </div>
                 </div>
            ) : (
                <button 
                  onClick={() => { setIsCreating(true); setNewCaseName(`Caso #${boards.length + 1}`); }}
                  className={`relative w-56 h-40 -ml-12 first:ml-0 transition-all duration-300 group`}
                  style={{ 
                      zIndex: hoveredId === 'new' ? 50 : 0,
                      transform: hoveredId === 'new' ? 'translateY(-1rem) scale(1.05) rotate(0deg)' : 'rotate(-3deg)'
                  }}
                  onMouseEnter={() => setHoveredId('new')}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className={`flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg shadow-lg ${isDarkMode ? 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/50' : 'border-gray-300 hover:border-gray-400 bg-white'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all group-hover:scale-110 ${isDarkMode ? 'bg-zinc-800 group-hover:bg-zinc-700' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
                      <Plus className={isDarkMode ? "text-zinc-400 group-hover:text-white" : "text-gray-500 group-hover:text-gray-800"} />
                    </div>
                    <span className={`${isDarkMode ? 'text-zinc-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-800'} font-mono text-sm font-bold`}>NUEVO CASO</span>
                  </div>
                </button>
            ))}

            {/* Case Files (Pila de Expedientes) */}
            {displayBoards.map((board, index) => {
              const isHovered = hoveredId === board.id;
              const isSelected = currentBoardId === board.id;
              const isDeleting = board.isDeleting;
              const rotation = index % 3 === 0 ? '2deg' : (index % 3 === 1 ? '-1deg' : '3deg');
              
              return (
              <div 
                key={board.id}
                draggable={isDraggable}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative w-56 h-40 -ml-12 transition-all duration-300 ease-out cursor-pointer group`}
                style={{ 
                    zIndex: isHovered ? 50 : index + 1, 
                    transform: isHovered ? 'translateY(-1.5rem) scale(1.1) rotate(0deg)' : `rotate(${rotation})`,
                    animation: isDeleting ? 'delete-burn 0.5s ease-in-out forwards' : 'none',
                    pointerEvents: isDeleting ? 'none' : 'auto'
                }}
                onMouseEnter={() => setHoveredId(board.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                    if (editingId !== board.id && !showTrash) onSwitch(board.id);
                }}
              >
                {/* Inner Card with 3D effect */}
                <div className={`relative flex flex-col h-full border-2 rounded-lg overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-colors duration-300
                    ${isSelected 
                        ? (isDarkMode ? 'border-yellow-500 bg-yellow-900/40' : 'border-yellow-500 bg-yellow-100')
                        : (isDarkMode 
                            ? (showTrash ? 'border-zinc-700 bg-zinc-900/50' : 'border-yellow-900/40 bg-yellow-950/30 hover:border-yellow-700 hover:bg-yellow-900/20')
                            : (showTrash ? 'border-gray-300 bg-gray-100' : 'border-yellow-200 bg-yellow-50 hover:border-yellow-300 hover:bg-yellow-100'))
                    }
                `}>
                    {/* Drag Handle Indicator */}
                    {isDraggable && isHovered && (
                        <div className="absolute top-2 right-2 text-yellow-600/50"><GripVertical size={16} /></div>
                    )}

                    {/* Tab visual with shadow for 3D effect */}
                    <div className={`absolute top-0 left-0 w-24 h-6 rounded-br-lg border-b-2 border-r-2 shadow-sm transition-colors duration-300
                        ${isSelected 
                            ? 'bg-yellow-500 border-yellow-500' 
                            : (isDarkMode 
                                ? (showTrash ? 'bg-zinc-800 border-zinc-700' : 'bg-yellow-900/40 border-yellow-900/40 group-hover:bg-yellow-800 group-hover:border-yellow-700')
                                : (showTrash ? 'bg-gray-300 border-gray-300' : 'bg-yellow-200 border-yellow-200 group-hover:bg-yellow-300 group-hover:border-yellow-300'))
                        }
                    `}></div>
                    
                    <div className="flex-1 p-4 pt-8 flex flex-col items-center justify-between text-center">
                        <div>
                            <FileText size={32} className={`mb-2 drop-shadow-md transition-colors duration-300 ${isSelected ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-yellow-800/60 group-hover:text-yellow-600' : 'text-yellow-300 group-hover:text-yellow-500')}`} />
                            
                            {editingId === board.id ? (
                                <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                                    <input 
                                        type="text" 
                                        name="edit-case-name"
                                        value={editName} 
                                        onChange={e => setEditName(e.target.value)}
                                        className={`${isDarkMode ? 'bg-zinc-950 border-zinc-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border text-xs p-1 w-full rounded outline-none focus:border-yellow-600 font-mono`}
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                                    />
                                    <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-400"><Check size={14}/></button>
                                </div>
                            ) : (
                                <h3 className={`font-mono font-bold text-sm line-clamp-2 ${currentBoardId === board.id ? (isDarkMode ? 'text-yellow-100' : 'text-yellow-800') : (isDarkMode ? (showTrash ? 'text-zinc-500 line-through' : 'text-zinc-300') : (showTrash ? 'text-gray-400 line-through' : 'text-gray-700'))}`} onDoubleClick={(e) => { if(!showTrash) { e.stopPropagation(); handleStartEdit(board); } }}>
                                {board.name}
                                </h3>
                            )}
                        </div>
                        <div className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} font-mono w-full`}>
                            {board.lastModified && <p>Modif: {new Date(board.lastModified).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>}
                            <p className={`${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`}>Creado: {new Date(board.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={`absolute bottom-2 right-2 flex gap-1 ${showTrash ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-50`} onClick={e => e.stopPropagation()}>
                        {!showTrash ? (
                            <>
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClone(board.id); }}
                                    className={`p-1.5 rounded border ${isDarkMode ? 'bg-zinc-900 text-zinc-500 hover:text-green-500 hover:bg-zinc-950 border-zinc-700' : 'bg-white text-gray-400 hover:text-green-600 hover:bg-gray-50 border-gray-200'}`}
                                    title="Clonar Caso"
                                >
                                    <Copy size={12} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleStartEdit(board); }}
                                    className={`p-1.5 rounded border ${isDarkMode ? 'bg-zinc-900 text-zinc-500 hover:text-blue-500 hover:bg-zinc-950 border-zinc-700' : 'bg-white text-gray-400 hover:text-blue-600 hover:bg-gray-50 border-gray-200'}`}
                                    title="Renombrar Caso"
                                >
                                    <Pencil size={12} />
                                </button>
                                {boards.length > 1 && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(board.id); }}
                                        className={`p-1.5 rounded border ${isDarkMode ? 'bg-zinc-900 text-zinc-500 hover:text-red-500 hover:bg-zinc-950 border-zinc-700' : 'bg-white text-gray-400 hover:text-red-600 hover:bg-gray-50 border-gray-200'}`}
                                        title="Mover a Papelera"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRestore(board.id); }}
                                className={`p-1.5 rounded border ${isDarkMode ? 'bg-zinc-900 text-green-500 hover:text-green-400 hover:bg-zinc-950 border-zinc-700' : 'bg-white text-green-600 hover:text-green-700 hover:bg-gray-50 border-gray-200'}`}
                                title="Restaurar Caso"
                            >
                                <RefreshCw size={12} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onPermanentDelete(board.id); }}
                                className={`p-1.5 rounded border ${isDarkMode ? 'bg-zinc-900 text-zinc-500 hover:text-red-500 hover:bg-zinc-950 border-zinc-700' : 'bg-white text-gray-400 hover:text-red-600 hover:bg-gray-50 border-gray-200'}`}
                                title="Eliminar Definitivamente"
                            >
                                <Trash2 size={12} />
                            </button>
                            </>
                        )}
                    </div>
                </div>
              </div>
            )})}
          </div>
        </div>
        
        {/* Footer */}
        <div className={`p-4 border-t text-center z-50 relative ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`${isDarkMode ? 'text-zinc-600' : 'text-gray-400'} text-[10px] font-mono`}>CONFIDENCIAL - SOLO PARA USO OFICIAL</p>
        </div>
      </div>
    </div>
  );
};

export default CaseManager;