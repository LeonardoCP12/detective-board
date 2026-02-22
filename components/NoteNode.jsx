import React, { memo, useMemo } from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from 'reactflow';
import { X, Pin, PinOff, Eraser } from 'lucide-react';
import Stamp from './Stamp';

const colors = {
  yellow: { bg: 'from-yellow-100 to-yellow-300', btn: 'bg-yellow-500' },
  green: { bg: 'from-green-100 to-green-300', btn: 'bg-green-500' },
  blue: { bg: 'from-blue-100 to-blue-300', btn: 'bg-blue-500' },
  red: { bg: 'from-red-100 to-red-300', btn: 'bg-red-500' },
  purple: { bg: 'from-purple-100 to-purple-300', btn: 'bg-purple-500' },
};

const NoteNode = ({ id, data, selected, isDarkMode }) => {
  const { deleteElements, setNodes } = useReactFlow();
  const isLocked = !!data.locked;
  const currentColor = colors[data.color] || colors.yellow;
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

  const changeColor = (colorKey) => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, color: colorKey } };
        }
        return n;
      })
    );
  };

  const removeStamp = () => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, status: null } };
        }
        return n;
      })
    );
  };

  return (
    <>
      <NodeResizer color="#eab308" isVisible={selected && !isLocked} minWidth={150} minHeight={150} handleStyle={{ width: 15, height: 15 }} />
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
          className={`nodrag absolute -top-3 -left-3 z-50 p-1 rounded-full shadow-md border transition-all ${isLocked ? 'bg-red-900 border-red-700 text-red-200' : 'bg-yellow-500 border-yellow-700 text-white hover:bg-yellow-600'}`}
        >
          {isLocked ? <Pin size={12} /> : <PinOff size={12} />}
        </button>
      )}

      {/* Selector de Color (Visible al seleccionar) */}
      {selected && !isLocked && (
        <div className={`nodrag absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1 p-1.5 rounded-full shadow-xl border z-50 backdrop-blur-sm ${isDarkMode ? 'bg-zinc-900/90 border-zinc-700' : 'bg-white/90 border-gray-200'}`}>
          {Object.entries(colors).map(([key, value]) => (
            <button
              key={key}
              onClick={() => changeColor(key)}
              className={`w-4 h-4 rounded-full ${value.btn} border border-white/20 hover:scale-125 transition-transform`}
            />
          ))}
          {data.status && (
            <button onClick={removeStamp} className={`w-4 h-4 rounded-full flex items-center justify-center border border-white/20 hover:scale-125 transition-transform ml-1 ${isDarkMode ? 'bg-zinc-700 text-zinc-400 hover:text-white' : 'bg-gray-200 text-gray-500 hover:text-black'}`} title="Quitar Sello">
              <Eraser size={10} />
            </button>
          )}
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

      {/* Status Stamps */}
      {data.status && (
        <div 
          className="absolute -top-4 -right-4 z-50 pointer-events-none select-none" 
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <Stamp status={data.status} key={JSON.stringify(data.status)} />
        </div>
      )}
      
      <div className={`relative h-full w-full bg-gradient-to-br ${currentColor.bg} shadow-[5px_5px_15px_rgba(0,0,0,0.5)] rotate-1 p-4 note-rough border-t border-l border-white/50 flex flex-col transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-[10px_15px_25px_rgba(0,0,0,0.6)] overflow-hidden ${isLocked ? 'nodrag' : ''} ${data.isDeleting ? 'deleting-note' : ''}`}>
        {/* Textura de papel separada para no sobrescribir el gradiente */}
        <div className="absolute inset-0 paper-texture pointer-events-none opacity-50 mix-blend-multiply" />
        <textarea
          name="note-content"
          className="nodrag relative z-10 w-full h-full bg-transparent resize-none outline-none text-gray-800 placeholder-yellow-600/50 text-lg leading-relaxed"
          placeholder="Escribe una nota..."
          defaultValue={data.label}
          onChange={(evt) => data.label = evt.target.value}
          style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
        />
      </div>
    </>
  );
};
export default memo(NoteNode);