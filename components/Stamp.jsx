// c:\Users\User\Desktop\Tablero\components\Stamp.jsx
import React from 'react';
import { CheckCircle, XCircle, Star, HelpCircle, AlertTriangle, Eye, Skull, Lock } from 'lucide-react';

const Stamp = ({ status }) => {
  // Manejo de Sello Personalizado (Objeto)
  if (typeof status === 'object' && status.type === 'custom') {
    return (
      <div 
        className="border-4 font-black text-xl px-2 py-1 rounded opacity-90 uppercase tracking-widest backdrop-blur-sm shadow-lg stamp-animation" 
        style={{ 
          fontFamily: 'Stencil, sans-serif',
          borderColor: status.color,
          color: status.color,
          backgroundColor: `${status.color}30`
        }}
      >
        {status.label}
      </div>
    );
  }

  switch (status) {
    // Sellos de Texto (Clásicos)
    case 'solved':
      return <div className="border-4 border-green-600 text-green-600 font-black text-xl px-2 py-1 rounded opacity-90 uppercase tracking-widest bg-green-950/30 backdrop-blur-sm shadow-lg stamp-animation" style={{ fontFamily: 'Stencil, sans-serif' }}>RESUELTO</div>;
    case 'discarded':
      return <div className="border-4 border-red-600 text-red-600 font-black text-xl px-2 py-1 rounded opacity-90 uppercase tracking-widest bg-red-950/30 backdrop-blur-sm shadow-lg stamp-animation" style={{ fontFamily: 'Stencil, sans-serif' }}>DESCARTADO</div>;
    case 'key':
      return <div className="border-4 border-yellow-500 text-yellow-500 font-black text-xl px-2 py-1 rounded opacity-90 uppercase tracking-widest bg-yellow-950/30 backdrop-blur-sm shadow-lg stamp-animation" style={{ fontFamily: 'Stencil, sans-serif' }}>CLAVE</div>;
    
    // Nuevos Sellos de Símbolos
    case 'question':
      return <div className="border-4 border-blue-500 text-blue-500 rounded-full p-2 opacity-90 backdrop-blur-sm shadow-lg stamp-animation bg-blue-950/30"><HelpCircle size={40} strokeWidth={3} /></div>;
    case 'important':
      return <div className="border-4 border-orange-500 text-orange-500 rounded-full p-2 opacity-90 backdrop-blur-sm shadow-lg stamp-animation bg-orange-950/30"><AlertTriangle size={40} strokeWidth={3} /></div>;
    case 'verify':
      return <div className="border-4 border-purple-500 text-purple-500 rounded-full p-2 opacity-90 backdrop-blur-sm shadow-lg stamp-animation bg-purple-950/30"><Eye size={40} strokeWidth={3} /></div>;
    case 'danger':
      return <div className="border-4 border-red-600 text-red-600 rounded-full p-2 opacity-90 backdrop-blur-sm shadow-lg stamp-animation bg-red-950/30"><Skull size={40} strokeWidth={3} /></div>;
    case 'confidential':
      return <div className="border-4 border-zinc-500 text-zinc-500 rounded-full p-2 opacity-90 backdrop-blur-sm shadow-lg stamp-animation bg-zinc-950/30"><Lock size={40} strokeWidth={3} /></div>;
    default:
      return null;
  }
};

export default Stamp;
