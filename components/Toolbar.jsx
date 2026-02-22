// c:\Users\User\Desktop\Tablero\components\Toolbar.jsx
import React from 'react';
import { Undo, Redo, Minimize } from 'lucide-react';

const Toolbar = ({ isZenMode, setIsZenMode, undo, redo, isDarkMode }) => {
  return (
    <div className="absolute top-4 right-4 z-50 flex gap-2">
      {!isZenMode && (
        <>
          <button onClick={undo} className={`px-4 py-2 border transition-colors text-xs uppercase font-bold rounded flex items-center justify-center gap-2 shadow-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700' : 'bg-white text-zinc-600 border-gray-300 hover:bg-gray-100'}`} title="Deshacer (Ctrl+Z)">
            <Undo size={14} /> Deshacer
          </button>
          <button onClick={redo} className={`px-4 py-2 border transition-colors text-xs uppercase font-bold rounded flex items-center justify-center gap-2 shadow-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700' : 'bg-white text-zinc-600 border-gray-300 hover:bg-gray-100'}`} title="Rehacer (Ctrl+Y)">
            <Redo size={14} /> Rehacer
          </button>
        </>
      )}
      {isZenMode && (
          <button onClick={() => setIsZenMode(false)} className="px-4 py-2 bg-black/50 hover:bg-black/80 text-white border border-white/20 rounded backdrop-blur-sm flex items-center gap-2 transition-all animate-in fade-in" title="Salir de Modo Zen (Esc)">
            <Minimize size={14} /> Salir
          </button>
      )}
    </div>
  );
};

export default Toolbar;
