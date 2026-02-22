import React, { memo } from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from 'reactflow';
import { X, Pin, PinOff, Type, Minus, Plus } from 'lucide-react';

const TextNode = ({ id, data, selected, isDarkMode }) => {
  const { deleteElements, setNodes } = useReactFlow();
  const isLocked = !!data.locked;

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

  const updateStyle = (key, value) => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, [key]: value } };
        }
        return n;
      })
    );
  };

  const colors = ['#e5e5e5', '#18181b', '#ef4444', '#3b82f6', '#22c55e', '#eab308'];
  const sizes = [
      { label: 'S', val: '14px' },
      { label: 'M', val: '24px' },
      { label: 'L', val: '36px' },
      { label: 'XL', val: '48px' }
  ];

  return (
    <>
      <NodeResizer color="#71717a" isVisible={selected && !isLocked} minWidth={100} minHeight={30} handleStyle={{ width: 15, height: 15 }} />
      {selected && (
        <button 
          onClick={() => {
            deleteElements({ nodes: [{ id }] });
          }}
          className="nodrag absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-50 transition-transform hover:scale-110"
        >
          <X size={12} />
        </button>
      )}
      {(selected || isLocked) && (
        <button 
          onClick={toggleLock}
          className={`nodrag absolute -top-3 -left-3 z-50 p-1 rounded-full shadow-md border transition-all ${isLocked ? 'bg-red-900 border-red-700 text-red-200' : (isDarkMode ? 'bg-zinc-800 border-zinc-600 text-zinc-400 hover:text-white' : 'bg-white border-gray-300 text-gray-500 hover:text-black')}`}
        >
          {isLocked ? <Pin size={12} /> : <PinOff size={12} />}
        </button>
      )}

      {/* Toolbar de Estilo (Visible al seleccionar) */}
      {selected && !isLocked && (
        <div className={`nodrag absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col gap-1 p-1.5 rounded-lg shadow-xl border z-50 backdrop-blur-sm items-center ${isDarkMode ? 'bg-zinc-900/90 border-zinc-700' : 'bg-white/90 border-gray-200'}`}>
            <div className="flex gap-1">
                {colors.map((c) => (
                    <button
                    key={c}
                    onClick={() => updateStyle('color', c)}
                    className={`w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform`}
                    style={{ backgroundColor: c }}
                    />
                ))}
            </div>
            <div className={`flex gap-1 border-t pt-1 mt-0.5 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                {sizes.map((s) => (
                    <button key={s.label} onClick={() => updateStyle('fontSize', s.val)} className={`text-[8px] px-1 font-mono border rounded ${isDarkMode ? 'text-zinc-300 hover:text-white border-zinc-700 bg-zinc-800 hover:bg-zinc-700' : 'text-zinc-600 hover:text-black border-gray-300 bg-gray-100 hover:bg-gray-200'}`}>{s.label}</button>
                ))}
            </div>
        </div>
      )}
      
      {/* Clavo y Handles unificados */}
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
      
      <div className={`h-full w-full p-2 flex items-center justify-center overflow-hidden border border-transparent hover:border-zinc-700/50 rounded transition-colors ${isLocked ? 'nodrag' : ''} ${data.isDeleting ? 'deleting-default' : ''}`}>
        <textarea
          name="text-content"
          className={`nodrag w-full h-full bg-transparent resize-none outline-none font-bold text-center p-2 ${!data.color ? 'text-node-content text-gray-200' : ''}`}
          placeholder="Escribe un título..."
          defaultValue={data.label}
          onChange={(evt) => data.label = evt.target.value}
          style={{ fontFamily: '"Courier Prime", monospace', color: data.color, fontSize: data.fontSize || '24px' }}
        />
      </div>
    </>
  );
};
export default memo(TextNode);