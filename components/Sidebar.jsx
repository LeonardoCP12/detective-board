import React, { useRef, useState, useEffect } from 'react';
import { User, MapPin, FileText, Calendar, StickyNote, Image as ImageIcon, Type, Sun, Moon, Search, HelpCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronsUp, ChevronsDown, FolderOpen, Minus, Activity, CornerDownRight, Save, Upload, Download, Trash2, Fingerprint, Layers, Maximize, BoxSelect, CheckCircle, XCircle, Star, AlertTriangle, Eye, Skull, Lock, PenTool, ArrowUp, ArrowDown, Palette, Link } from 'lucide-react';

const Sidebar = ({ connectionColor = '#dc2626', setConnectionColor = () => {}, connectionLineType, setConnectionLineType, lastSaved, onSave, onLoad, onClear, onHelp, isDarkMode, toggleTheme, searchTerm, setSearchTerm, onExport, isOpen, onToggle, onOpenCaseManager, currentBoardName, onToggleZen, onNextMatch, onPrevMatch, onToggleBg }) => {
  const fileInputRef = useRef(null);
  const [sectionsState, setSectionsState] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar-sections');
      return saved ? JSON.parse(saved) : {
        evidence: true,
        connection: true,
        extras: true,
        zones: true
      };
    } catch (e) {
      return { evidence: true, connection: true, extras: true, zones: true };
    }
  });

  useEffect(() => {
    localStorage.setItem('sidebar-sections', JSON.stringify(sectionsState));
  }, [sectionsState]);

  const toggleSection = (key) => {
    setSectionsState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllSections = () => {
    const anyOpen = Object.values(sectionsState).some(v => v);
    setSectionsState(Object.keys(sectionsState).reduce((acc, key) => ({ ...acc, [key]: !anyOpen }), {}));
  };

  const onDragStart = (event, nodeType, category) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/category', category);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`absolute top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <aside className={`h-full w-80 border-r flex flex-col shadow-2xl backdrop-blur-xl transition-colors duration-500 ease-in-out ${isDarkMode ? 'bg-zinc-900/95 border-zinc-800' : 'bg-white/90 border-gray-200'}`}>
      <div className={`p-3 border-b transition-colors duration-500 ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-lg font-bold text-red-500 tracking-widest uppercase leading-tight">Detective<br/>Board</h1>
            </div>
            <div className="flex gap-1">
              <button onClick={toggleAllSections} className={`p-2 rounded-full ${isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-gray-100 text-zinc-600 hover:bg-gray-200'}`} title={Object.values(sectionsState).some(v => v) ? "Colapsar todo" : "Expandir todo"}>
                  {Object.values(sectionsState).some(v => v) ? <ChevronsUp size={16} /> : <ChevronsDown size={16} />}
              </button>
              <button onClick={onToggleZen} className={`p-2 rounded-full ${isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-gray-100 text-zinc-600 hover:bg-gray-200'}`} title="Modo Zen (Pantalla Completa)">
                  <Maximize size={16} />
              </button>
              <button onClick={onToggleBg} className={`p-2 rounded-full ${isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-gray-100 text-zinc-600 hover:bg-gray-200'}`} title="Cambiar Fondo (Corcho/Pizarra/Papel)">
                  <Palette size={16} />
              </button>
              <button onClick={toggleTheme} className={`p-2 rounded-full ${isDarkMode ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-gray-100 text-zinc-600 hover:bg-gray-200'}`} title="Cambiar tema">
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
        </div>
        {currentBoardName && (
          <div className="mt-2 px-2 py-1 bg-zinc-100/5 rounded border border-zinc-500/20">
            <p className="text-xs text-zinc-500 font-mono uppercase mb-0">Expediente:</p>
            <p className={`text-xs font-bold font-mono truncate w-full ${isDarkMode ? 'text-yellow-500' : 'text-yellow-700'}`} title={currentBoardName}>
              {currentBoardName}
            </p>
          </div>
        )}
      </div>

      {/* Barra de Búsqueda */}
      <div className={`px-3 pt-2 pb-1`}>
        <div className={`flex items-center px-2 py-1.5 rounded border transition-colors duration-500 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-300'}`}>
          <Search size={12} className="text-zinc-500 mr-2" />
          <input type="text" name="search" placeholder="Buscar pistas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`bg-transparent w-full text-xs outline-none font-mono ${isDarkMode ? 'text-zinc-300 placeholder-zinc-600' : 'text-zinc-700 placeholder-zinc-400'}`} />
          {searchTerm && (
            <div className="flex gap-1 ml-1 border-l border-zinc-700 pl-1">
                <button type="button" onClick={(e) => { e.preventDefault(); onPrevMatch(); }} className="p-0.5 hover:text-white text-zinc-500 transition-colors" title="Anterior"><ArrowUp size={12}/></button>
                <button type="button" onClick={(e) => { e.preventDefault(); onNextMatch(); }} className="p-0.5 hover:text-white text-zinc-500 transition-colors" title="Siguiente"><ArrowDown size={12}/></button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 space-y-2 overflow-y-auto">
        {/* Grupo Evidencia */}
        <SidebarSection title="Evidencia" icon={Fingerprint} isDarkMode={isDarkMode} isOpen={sectionsState.evidence} onToggle={() => toggleSection('evidence')}>
            <div className="grid grid-cols-2 gap-1.5">
                <DraggableItem onDragStart={onDragStart} type="evidence" category="person" icon={User} label="Sospechoso" color="border-blue-500" isDarkMode={isDarkMode} compact />
                <DraggableItem onDragStart={onDragStart} type="evidence" category="place" icon={MapPin} label="Lugar" color="border-green-500" isDarkMode={isDarkMode} compact />
                <DraggableItem onDragStart={onDragStart} type="evidence" category="clue" icon={FileText} label="Pista" color="border-yellow-500" isDarkMode={isDarkMode} compact />
                <DraggableItem onDragStart={onDragStart} type="evidence" category="event" icon={Calendar} label="Evento" color="border-red-500" isDarkMode={isDarkMode} compact />
            </div>
        </SidebarSection>
        
        {/* Panel de Herramientas de Conexión Compacto */}
        <SidebarSection title="Configuración de Hilo" icon={Activity} isDarkMode={isDarkMode} isOpen={sectionsState.connection} onToggle={() => toggleSection('connection')}>
            
            <div className="flex items-center justify-center gap-3 mb-2 px-1 py-0.5">
                {[
                    { color: '#dc2626', label: 'Rojo' },
                    { color: '#3b82f6', label: 'Azul' },
                    { color: '#22c55e', label: 'Verde' },
                    { color: '#eab308', label: 'Amarillo' },
                    { color: '#a855f7', label: 'Morado' },
                ].map((c) => (
                    <button
                    key={c.color}
                    onClick={() => setConnectionColor(c.color)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${connectionColor === c.color ? 'border-white scale-100 ring-1 ring-zinc-500' : 'border-transparent hover:scale-100'}`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                    />
                ))}
            </div>
            
            <div className="flex gap-1">
                <button 
                    onClick={() => setConnectionLineType('straight')}
                    className={`flex-1 py-1.5 rounded border flex justify-center items-center transition-colors ${connectionLineType === 'straight' ? (isDarkMode ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-white border-gray-300 text-black shadow-sm') : (isDarkMode ? 'border-transparent text-zinc-500 hover:bg-zinc-800/50' : 'border-transparent text-zinc-400 hover:bg-gray-100')}`}
                    title="Línea Recta"
                ><Minus size={14} /></button>
                <button 
                    onClick={() => setConnectionLineType('default')}
                    className={`flex-1 py-1.5 rounded border flex justify-center items-center transition-colors ${connectionLineType === 'default' ? (isDarkMode ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-white border-gray-300 text-black shadow-sm') : (isDarkMode ? 'border-transparent text-zinc-500 hover:bg-zinc-800/50' : 'border-transparent text-zinc-400 hover:bg-gray-100')}`}
                    title="Línea Curva"
                ><Activity size={14} /></button>
                <button 
                    onClick={() => setConnectionLineType('step')}
                    className={`flex-1 py-1.5 rounded border flex justify-center items-center transition-colors ${connectionLineType === 'step' ? (isDarkMode ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-white border-gray-300 text-black shadow-sm') : (isDarkMode ? 'border-transparent text-zinc-500 hover:bg-zinc-800/50' : 'border-transparent text-zinc-400 hover:bg-gray-100')}`}
                    title="Línea Escalonada"
                ><CornerDownRight size={14} /></button>
            </div>
        </SidebarSection>

        {/* Grupo Extras */}
        <SidebarSection title="Extras" icon={Layers} isDarkMode={isDarkMode} isOpen={sectionsState.extras} onToggle={() => toggleSection('extras')}>
            <div className="grid grid-cols-4 gap-1.5">
                <DraggableItem onDragStart={onDragStart} type="note" category="note" icon={StickyNote} label="Nota" color="border-yellow-400" isDarkMode={isDarkMode} compact />
                <DraggableItem onDragStart={onDragStart} type="text" category="text" icon={Type} label="Texto" color="border-zinc-500" isDarkMode={isDarkMode} compact />
                <DraggableItem onDragStart={onDragStart} type="image" category="image" icon={ImageIcon} label="Imagen" color="border-purple-500" isDarkMode={isDarkMode} compact />
                <DraggableItem onDragStart={onDragStart} type="url" category="url" icon={Link} label="URL" color="border-blue-500" isDarkMode={isDarkMode} compact />
            </div>
        </SidebarSection>

        {/* Grupo Zonas y Marcadores */}
        <SidebarSection title="Zonas y Sellos" icon={BoxSelect} isDarkMode={isDarkMode} isOpen={sectionsState.zones} onToggle={() => toggleSection('zones')}>
            <div className="space-y-2">
                <DraggableItem onDragStart={onDragStart} type="zone" category="zone" icon={BoxSelect} label="Zona de Grupo" color="border-zinc-600" isDarkMode={isDarkMode} />
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <DraggableItem onDragStart={onDragStart} type="stamp" category="solved" icon={CheckCircle} label="Resuelto" color="border-green-600" isDarkMode={isDarkMode} compact />
                  <DraggableItem onDragStart={onDragStart} type="stamp" category="discarded" icon={XCircle} label="Descartado" color="border-red-600" isDarkMode={isDarkMode} compact />
                  <DraggableItem onDragStart={onDragStart} type="stamp" category="key" icon={Star} label="Clave" color="border-yellow-500" isDarkMode={isDarkMode} compact />
                  <DraggableItem onDragStart={onDragStart} type="stamp" category="question" icon={HelpCircle} label="?" color="border-blue-500" isDarkMode={isDarkMode} compact />
                  <DraggableItem onDragStart={onDragStart} type="stamp" category="important" icon={AlertTriangle} label="!" color="border-orange-500" isDarkMode={isDarkMode} compact />
                  <DraggableItem onDragStart={onDragStart} type="stamp" category="verify" icon={Eye} label="Ojo" color="border-purple-500" isDarkMode={isDarkMode} compact />
                  <DraggableItem onDragStart={onDragStart} type="stamp" category="danger" icon={Skull} label="Peligro" color="border-red-600" isDarkMode={isDarkMode} compact />
                  <DraggableItem onDragStart={onDragStart} type="stamp" category="confidential" icon={Lock} label="Top" color="border-zinc-500" isDarkMode={isDarkMode} compact />
                  <DraggableItem onDragStart={onDragStart} type="stamp" category="custom" icon={PenTool} label="Personalizado" color="border-zinc-400" isDarkMode={isDarkMode} compact />
                </div>
            </div>
        </SidebarSection>
      </div>

      <div className={`mt-auto p-3 border-t space-y-2 transition-colors duration-500 ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
        <button onClick={onOpenCaseManager} title="Abrir gestor de expedientes" className={`w-full py-2 border transition-colors text-xs uppercase font-bold rounded flex items-center justify-center gap-2 ${isDarkMode ? 'bg-yellow-900/20 text-yellow-500 border-yellow-900/50 hover:bg-yellow-900/40' : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'}`}>
          <FolderOpen size={14} /> Gestionar Casos
        </button>

        {/* Grid de Acciones de Archivo */}
        <div className="grid grid-cols-3 gap-2">
            <button onClick={onSave} className={`flex flex-col items-center justify-center p-2 border rounded transition-colors ${isDarkMode ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white' : 'bg-white text-zinc-600 border-gray-200 hover:bg-gray-50 hover:text-black shadow-sm'}`} title="Guardar (JSON)">
                <Save size={16} className="mb-1"/>
                <span className="text-[9px] font-bold uppercase">Guardar</span>
            </button>
            <button onClick={() => fileInputRef.current.click()} className={`flex flex-col items-center justify-center p-2 border rounded transition-colors ${isDarkMode ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white' : 'bg-white text-zinc-600 border-gray-200 hover:bg-gray-50 hover:text-black shadow-sm'}`} title="Cargar (JSON)">
                <Upload size={16} className="mb-1"/>
                <span className="text-[9px] font-bold uppercase">Cargar</span>
            </button>
            <button onClick={onExport} className={`flex flex-col items-center justify-center p-2 border rounded transition-colors ${isDarkMode ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white' : 'bg-white text-zinc-600 border-gray-200 hover:bg-gray-50 hover:text-black shadow-sm'}`} title="Exportar (PNG)">
                <Download size={16} className="mb-1"/>
                <span className="text-[9px] font-bold uppercase">PNG</span>
            </button>
        </div>
        <input type="file" name="file-upload" ref={fileInputRef} onChange={onLoad} className="hidden" accept=".json" />

        {/* Grid de Utilidades */}
        <div className="grid grid-cols-2 gap-2">
            <button onClick={onClear} title="Borrar todo el contenido" className={`py-2 border transition-colors text-[10px] uppercase font-bold rounded flex items-center justify-center gap-2 ${isDarkMode ? 'bg-red-900/20 text-red-500 border-red-900/50 hover:bg-red-900/40' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
            <Trash2 size={14} /> Limpiar
            </button>

            <button onClick={onHelp} title="Ver atajos de teclado" className={`py-2 border transition-colors text-[10px] uppercase font-bold rounded flex items-center justify-center gap-2 ${isDarkMode ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white' : 'bg-white text-zinc-600 border-gray-200 hover:bg-gray-50 hover:text-black shadow-sm'}`}>
            <HelpCircle size={14} /> Ayuda
            </button>
        </div>

        {lastSaved && (
            <div className={`text-[10px] text-center mt-2 font-mono ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`}>Guardado: {lastSaved.toLocaleTimeString()}</div>
        )}
      </div>
    </aside>

    <button
        onClick={onToggle}
        className={`absolute top-6 -right-8 p-1.5 rounded-r-md shadow-md border-y border-r cursor-pointer flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-gray-200 text-zinc-600 hover:text-black'}`}
        title={isOpen ? "Ocultar barra lateral" : "Mostrar barra lateral"}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
};

const SidebarSection = ({ title, icon: Icon, isDarkMode, children, isOpen, onToggle }) => (
  <div className={`p-2 rounded-lg border transition-all duration-200 ${isDarkMode ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}>
      <button 
          onClick={onToggle}
          className={`w-full text-xs font-bold uppercase flex items-center justify-between gap-2 ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-600 hover:text-zinc-800'}`}
      >
          <div className="flex items-center gap-2">
              <Icon size={10}/> {title}
          </div>
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
             <ChevronDown size={12} />
          </div>
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
          <div className="overflow-hidden">
              {children}
          </div>
      </div>
  </div>
);

const DraggableItem = ({ onDragStart, type, category, icon: Icon, label, color, isDarkMode, compact }) => (
  <div
    className={`${compact ? 'flex flex-col items-center justify-center p-2 gap-1 text-center' : 'flex items-center gap-3 p-3'} rounded cursor-grab border-l-4 ${color.replace('border-', 'border-l-')} transition-all ${compact ? 'hover:scale-105' : 'hover:translate-x-2'} ${isDarkMode ? 'bg-zinc-800/40 border-y border-r border-zinc-800 hover:bg-zinc-800' : 'bg-white border-y border-r border-gray-200 hover:bg-gray-50 shadow-sm'}`}
    onDragStart={(event) => onDragStart(event, type, category)}
    draggable
    title={label}
  >
    <Icon size={compact ? 16 : 18} className={color.replace('border-', 'text-')} />
    <span className={`${compact ? 'text-[10px]' : 'text-sm'} font-bold font-mono ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{label}</span>
  </div>
);

export default Sidebar;