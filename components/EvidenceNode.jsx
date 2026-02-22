import React, { memo, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, useReactFlow, NodeResizer } from 'reactflow';
import { User, MapPin, FileText, Calendar, Pin, PinOff } from 'lucide-react';
import Stamp from './Stamp';

const categoryStyles = {
  person: { 
    color: 'border-blue-500', 
    icon: User, 
    dark: { bg: 'bg-gradient-to-br from-blue-900 to-blue-950', text: 'text-gray-400', title: 'text-gray-100', border: 'border-white/10' },
    light: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', text: 'text-blue-900/70', title: 'text-blue-950', border: 'border-black/10' }
  },
  place: { 
    color: 'border-green-500', 
    icon: MapPin, 
    dark: { bg: 'bg-gradient-to-br from-green-900 to-green-950', text: 'text-gray-400', title: 'text-gray-100', border: 'border-white/10' },
    light: { bg: 'bg-gradient-to-br from-green-50 to-green-100', text: 'text-green-900/70', title: 'text-green-950', border: 'border-black/10' }
  },
  clue: { 
    color: 'border-orange-500', 
    icon: FileText, 
    dark: { bg: 'bg-gradient-to-br from-orange-900 to-orange-950', text: 'text-gray-400', title: 'text-gray-100', border: 'border-white/10' },
    light: { bg: 'bg-gradient-to-br from-orange-50 to-orange-100', text: 'text-orange-900/70', title: 'text-orange-950', border: 'border-black/10' }
  },
  event: { 
    color: 'border-red-500', 
    icon: Calendar, 
    dark: { bg: 'bg-gradient-to-br from-red-900 to-red-950', text: 'text-gray-400', title: 'text-gray-100', border: 'border-white/10' },
    light: { bg: 'bg-gradient-to-br from-red-50 to-red-100', text: 'text-red-900/70', title: 'text-red-950', border: 'border-black/10' }
  },
};

const EvidenceNode = ({ id, data, selected, isDarkMode }) => {
  const baseStyle = categoryStyles[data.category] || categoryStyles.clue;
  const style = isDarkMode ? baseStyle.dark : baseStyle.light;
  const Icon = baseStyle.icon;
  const { setNodes } = useReactFlow();
  const isLocked = !!data.locked;
  const [showFullImage, setShowFullImage] = useState(false);
  const rotation = useMemo(() => Math.floor(Math.random() * 40) - 20, [data.status]);

  const toggleLock = (e) => {
    e.stopPropagation();
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          const currLocked = !!n.data.locked;
          return { ...n, draggable: true, data: { ...n.data, locked: !currLocked } };
        }
        return n;
      })
    );
  };

  return (
    <div
      className={`
        relative h-full w-full shadow-[0_10px_20px_-5px_rgba(0,0,0,0.6)] rounded-sm border-l-4 transition-all duration-300 ease-out group
        ${baseStyle.color} ${style.bg}
        ${selected ? 'ring-2 ring-white scale-105 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] z-50' : 'hover:scale-105 hover:-translate-y-1 hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.8)] hover:z-40'}
        ${isLocked ? 'nodrag' : ''} ${data.isDeleting ? 'deleting-default' : ''}
      `}
    >
      <NodeResizer color="#ef4444" isVisible={selected && !isLocked} minWidth={250} minHeight={150} handleStyle={{ width: 15, height: 15 }} />
      {/* Botón de Bloqueo (Candado) */}
      {(selected || isLocked) && (
        <button 
          onClick={toggleLock}
          className={`nodrag absolute -top-3 -left-3 z-50 p-1 rounded-full shadow-md border transition-all ${isLocked ? 'bg-red-900 border-red-700 text-red-200' : (isDarkMode ? 'bg-zinc-800 border-zinc-600 text-zinc-400 hover:text-white' : 'bg-white border-gray-300 text-gray-500 hover:text-black')}`}
        >
          {isLocked ? <Pin size={12} /> : <PinOff size={12} />}
        </button>
      )}

      {/* Pin Assembly (Clavo + Handles unificados) */}
      <div className="absolute -top-3 w-4 h-4 z-50" style={{ left: 'calc(50% - 8px)' }}>
        <div className="w-full h-full rounded-full pin-3d pointer-events-none" />
        <Handle 
          type="target" 
          position={Position.Top} 
          style={{ position: 'absolute', top: '7px', left: '7px', width: '2px', height: '2px', opacity: 0, background: 'transparent', border: 'none' }} 
        />
        <Handle 
          type="source" 
          position={Position.Top} 
          style={{ position: 'absolute', top: '7px', left: '7px', width: '2px', height: '2px', opacity: 0, background: 'transparent', border: 'none' }} 
        />
      </div>
      
      {/* Status Stamps */}
      {data.status && (
        <div 
          className="absolute -top-4 -right-4 z-50 pointer-events-none select-none" 
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <Stamp status={data.status} key={JSON.stringify(data.status)} />
        </div>
      )}

      <div className="p-3 flex flex-col gap-2 h-full w-full overflow-hidden">
        {/* Cabecera */}
        <div className={`flex items-center justify-between border-b ${style.border} pb-2`}>
          <span className={`text-xs uppercase tracking-widest ${style.text} font-bold`}>
            {data.category}
          </span>
          <Icon size={16} className={style.text} />
        </div>

        {/* Imagen Opcional */}
        {data.image && (
          <div 
            className={`nodrag w-full h-32 overflow-hidden rounded-sm border ${style.border} sepia-[.5] cursor-zoom-in hover:sepia-0 transition-all`}
            onClick={(e) => {
              e.stopPropagation();
              setShowFullImage(true);
            }}
          >
            <img src={data.image} alt="evidence" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Visor de Imagen HD */}
        {showFullImage && createPortal(
          <div 
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-8 cursor-zoom-out backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setShowFullImage(false); }}
          >
            <img src={data.image} alt="Evidence HD" className="max-w-full max-h-full object-contain shadow-2xl rounded-sm" />
          </div>,
          document.body
        )}

        {/* Contenido */}
        <div>
          <h3 className={`text-lg font-bold ${style.title} leading-tight font-mono`}>
            {data.label}
          </h3>
          <p className={`text-xs ${style.text} mt-1 font-mono leading-relaxed`}>
            {data.description}
          </p>
        </div>
      </div>

    </div>
  );
};

export default memo(EvidenceNode);