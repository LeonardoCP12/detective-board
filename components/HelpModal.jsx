import React from 'react';
import { X, Keyboard, MousePointer, Lock } from 'lucide-react';

const HelpModal = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Doble Clic (Nodo)', desc: 'Editar contenido de la evidencia', icon: MousePointer },
    { key: 'Doble Clic (Hilo)', desc: 'Añadir/Editar etiqueta de relación', icon: MousePointer },
    { key: 'Clic (Hilo)', desc: 'Cambiar estilo (Sólido / Punteado)', icon: MousePointer },
    { key: 'Backspace', desc: 'Eliminar elementos seleccionados', icon: Keyboard },
    { key: 'Ctrl + D', desc: 'Duplicar nodos seleccionados', icon: Keyboard },
    { key: 'Ctrl + Z', desc: 'Deshacer acción', icon: Keyboard },
    { key: 'Ctrl + Y', desc: 'Rehacer acción', icon: Keyboard },
    { key: 'Ctrl + S', desc: 'Guardar tablero manualmente', icon: Keyboard },
    { key: 'Ctrl + V', desc: 'Pegar imagen del portapapeles', icon: Keyboard },
    { key: 'F3 / Shift + F3', desc: 'Navegar resultados de búsqueda', icon: Keyboard },
    { key: 'Shift + C', desc: 'Conectar nodos seleccionados', icon: Keyboard },
    { key: 'Ctrl + Shift + L', desc: 'Bloquear/Desbloquear selección', icon: Lock },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'} border p-6 rounded-lg w-[500px] shadow-2xl animate-in zoom-in duration-200 relative`}>
        <button onClick={onClose} className={`absolute top-4 right-4 ${isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'} transition-colors`}>
          <X size={20} />
        </button>
        
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'} font-mono tracking-wider mb-6 flex items-center gap-2`}>
          <Keyboard className="text-red-500" /> ATAJOS DE TECLADO
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {shortcuts.map((s, i) => (
            <div key={i} className={`flex items-center justify-between p-2 rounded border transition-colors ${isDarkMode ? 'bg-zinc-950/50 border-zinc-800/50 hover:border-zinc-700' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-center gap-3">
                <s.icon size={14} className={isDarkMode ? "text-zinc-500" : "text-gray-400"} />
                <span className={`${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} text-sm font-mono`}>{s.desc}</span>
              </div>
              <span className="text-xs font-bold text-red-400 bg-red-900/10 px-2 py-1 rounded border border-red-900/20 font-mono">
                {s.key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
