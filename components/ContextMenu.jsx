import React, { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { StickyNote, Type, Image as ImageIcon, Crosshair, Link } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function ContextMenu({ top, left, right, bottom, clientX, clientY, onHide, takeSnapshot, setNodes }) {
  const { screenToFlowPosition, setCenter, getZoom } = useReactFlow();

  const handleCenter = (e) => {
    e.stopPropagation();
    const { x, y } = screenToFlowPosition({ x: clientX, y: clientY });
    setCenter(x, y, { zoom: getZoom(), duration: 800 });
    onHide();
  };

  const addNode = useCallback((type, category, label) => {
    const position = screenToFlowPosition({ x: clientX, y: clientY });
    
    const newNode = {
      id: uuidv4(),
      type,
      position,
      data: { label, category },
    };

    takeSnapshot();
    setNodes((nds) => nds.concat(newNode));
    onHide();
  }, [clientX, clientY, screenToFlowPosition, takeSnapshot, setNodes, onHide]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="absolute z-50 bg-zinc-800 border border-zinc-700 shadow-xl rounded-md overflow-hidden min-w-[150px] flex flex-col animate-in fade-in zoom-in duration-100"
    >
      <button onClick={handleCenter} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2 transition-colors border-b border-zinc-700">
        <Crosshair size={14} className="text-blue-400" /> Centrar Vista
      </button>
      <button onClick={() => addNode('note', 'note', 'Nota')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2 transition-colors">
        <StickyNote size={14} className="text-yellow-500" /> Añadir Nota
      </button>
      <button onClick={() => addNode('text', 'text', 'Texto')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2 transition-colors">
        <Type size={14} className="text-zinc-400" /> Añadir Texto
      </button>
      <button onClick={() => addNode('image', 'image', 'Imagen')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2 transition-colors">
        <ImageIcon size={14} className="text-purple-500" /> Añadir Imagen
      </button>
      <button onClick={() => addNode('url', 'url', 'Enlace')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2 transition-colors">
        <Link size={14} className="text-blue-400" /> Añadir URL
      </button>
    </div>
  );
}