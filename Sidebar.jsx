import React from 'react';
import { 
  Save, FolderOpen, Trash2, HelpCircle, Moon, Sun, 
  Search, Image as ImageIcon, ChevronLeft, ChevronRight,
  Briefcase, Monitor, LogOut, Layout
} from 'lucide-react';

const Sidebar = ({ 
  connectionColor, setConnectionColor, 
  connectionLineType, setConnectionLineType,
  lastSaved, onSave, onLoad, onClear, onHelp,
  isDarkMode, toggleTheme,
  searchTerm, setSearchTerm,
  onExport, isOpen, onToggle,
  onOpenCaseManager, currentBoardName,
  onToggleZen, onNextMatch, onPrevMatch,
  onToggleBg, onLogout
}) => {
  
  const tools = [
    { type: 'note', label: 'Nota', color: '#fef3c7' },
    { type: 'image', label: 'Imagen', color: '#e0f2fe' },
    { type: 'url', label: 'Enlace', color: '#dcfce7' },
    { type: 'zone', label: 'Zona', color: 'transparent' },
  ];

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${isOpen ? 'w-80' : 'w-0'} ${isDarkMode ? 'bg-zinc-900 border-r border-zinc-800' : 'bg-white border-r border-gray-200 shadow-xl'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className={`absolute -right-8 top-6 p-1 rounded-r-md border-y border-r ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-white border-gray-200 text-gray-600'}`}
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      <div className={`flex flex-col h-full overflow-hidden ${!isOpen && 'opacity-0'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800/10 dark:border-zinc-100/10">
          <h1 className={`text-xl font-black font-mono tracking-widest mb-1 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>DETECTIVE</h1>
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-mono text-red-500 uppercase">{currentBoardName || 'CASO #001'}</span>
             <span className="text-[10px] text-zinc-500">{lastSaved ? 'Guardado' : 'Sin guardar'}</span>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 pb-0">
            <div className={`flex items-center px-3 py-2 rounded-md border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
                <Search size={14} className="text-zinc-500 mr-2" />
                <input 
                    type="text" 
                    placeholder="Buscar evidencia..." 
                    className="bg-transparent border-none outline-none text-xs w-full font-mono"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {(searchTerm) && (
                    <div className="flex gap-1">
                        <button onClick={onPrevMatch} className="hover:text-blue-500"><ChevronLeft size={12}/></button>
                        <button onClick={onNextMatch} className="hover:text-blue-500"><ChevronRight size={12}/></button>
                    </div>
                )}
            </div>
        </div>

        {/* Tools */}
        <div className="p-4 grid grid-cols-2 gap-3">
            {tools.map((tool) => (
                <div 
                    key={tool.type}
                    className={`p-3 rounded border cursor-grab active:cursor-grabbing flex flex-col items-center gap-2 transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                    onDragStart={(event) => onDragStart(event, tool.type)}
                    draggable
                >
                    <div className="w-8 h-8 rounded bg-zinc-500/20"></div>
                    <span className="text-xs font-bold uppercase">{tool.label}</span>
                </div>
            ))}
        </div>

        {/* Actions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button onClick={onOpenCaseManager} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                <Briefcase size={16} /> GESTOR DE CASOS
            </button>
            <button onClick={onSave} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                <Save size={16} /> GUARDAR TABLERO
            </button>
            <button onClick={onExport} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                <ImageIcon size={16} /> EXPORTAR IMAGEN
            </button>
            <button onClick={onToggleZen} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                <Monitor size={16} /> MODO ZEN
            </button>
            <button onClick={onToggleBg} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                <Layout size={16} /> CAMBIAR FONDO
            </button>
            <button onClick={onClear} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition-colors text-red-500 hover:bg-red-500/10`}>
                <Trash2 size={16} /> LIMPIAR TODO
            </button>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
                <button onClick={toggleTheme} className={`p-2 rounded-full ${isDarkMode ? 'bg-zinc-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button onClick={onHelp} className={`p-2 rounded-full ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-600'}`}>
                    <HelpCircle size={16} />
                </button>
            </div>
            
            {/* Logout Button */}
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs uppercase tracking-wider transition-colors"
            >
                <LogOut size={14} /> CERRAR SESIÓN
            </button>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;