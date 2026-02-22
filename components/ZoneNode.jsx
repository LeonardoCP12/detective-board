// c:\Users\User\Desktop\Tablero\components\ZoneNode.jsx
import React, { memo } from 'react';
import { NodeResizer, useReactFlow } from 'reactflow';
import { Pin, PinOff } from 'lucide-react';

const ZoneNode = ({ id, data, selected, style, isDarkMode }) => {
  const { setNodes } = useReactFlow();
  const borderColor = style?.borderColor || '#71717a';
  const bgColor = style?.backgroundColor || (isDarkMode ? 'rgba(113, 113, 122, 0.05)' : 'rgba(100, 116, 139, 0.05)');
  const isLocked = !!data.locked;

  const toggleLock = (e) => {
    e.stopPropagation();
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          const currLocked = !!n.data.locked;
          return { ...n, draggable: currLocked, data: { ...n.data, locked: !currLocked } };
        }
        return n;
      })
    );
  };

  return (
    <>
      <NodeResizer color={borderColor} isVisible={selected && !isLocked} minWidth={150} minHeight={150} />
      
      {(selected || isLocked) && (
        <button 
          onClick={toggleLock} 
          className={`nodrag absolute -top-3 -left-3 z-50 p-1 rounded-full shadow-md border transition-all ${isLocked ? 'bg-red-900 border-red-700 text-red-200' : (isDarkMode ? 'bg-zinc-800 border-zinc-600 text-zinc-400 hover:text-white' : 'bg-white border-gray-300 text-gray-500 hover:text-black')}`}
        >
          {isLocked ? <Pin size={12} /> : <PinOff size={12} />}
        </button>
      )}

      <div 
        className={`h-full w-full border-2 border-dashed rounded-xl transition-colors ${isLocked ? 'nodrag' : ''} ${data.isDeleting ? 'deleting-zone' : ''}`}
        style={{ borderColor, backgroundColor: bgColor }}
      >
        <div 
            className={`absolute -top-3 left-4 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest select-none whitespace-nowrap shadow-sm ${isDarkMode ? 'bg-zinc-800 border border-zinc-700 text-zinc-400' : 'bg-white border border-gray-300 text-gray-600'}`}
        >
          {data.label}
        </div>
      </div>
    </>
  );
};
export default memo(ZoneNode);
