import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, Move } from 'lucide-react';

const CropModal = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Resetear estado al abrir
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    const image = imageRef.current;

    // Usamos el tamaño del contenedor como tamaño de salida (400x400)
    const cropWidth = container.clientWidth;
    const cropHeight = container.clientHeight;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Calculamos el centro
    const cx = cropWidth / 2;
    const cy = cropHeight / 2;

    // Dibujamos la imagen transformada en el canvas
    ctx.translate(cx + position.x, cy + position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

    // Exportamos y cerramos
    onCropComplete(canvas.toDataURL('image/jpeg', 0.9));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="w-full max-w-lg flex justify-between items-center mb-4">
        <h2 className="text-zinc-100 font-mono font-bold text-lg flex items-center gap-2"><Move size={18}/> AJUSTAR RECORTE</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-white"><X /></button>
      </div>

      {/* Área de Recorte */}
      <div 
        ref={containerRef}
        className="relative w-[400px] h-[400px] bg-zinc-900 overflow-hidden border-2 border-dashed border-zinc-500 cursor-move shadow-2xl rounded-sm"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <img 
          ref={imageRef}
          src={imageSrc} 
          alt="Crop target" 
          className="absolute max-w-none origin-center pointer-events-none"
          style={{ 
            left: '50%', 
            top: '50%', 
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})` 
          }}
        />
        {/* Guías visuales (Regla de tercios) */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="w-full h-1/3 border-b border-white/50 absolute top-0"></div>
            <div className="w-full h-1/3 border-b border-white/50 absolute top-1/3"></div>
            <div className="h-full w-1/3 border-r border-white/50 absolute left-0"></div>
            <div className="h-full w-1/3 border-r border-white/50 absolute left-1/3"></div>
        </div>
      </div>

      {/* Controles de Zoom */}
      <div className="mt-6 flex items-center gap-4 w-full max-w-md bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <ZoomOut size={20} className="text-zinc-400" />
        <input 
          type="range" 
          name="crop-scale"
          min="0.1" 
          max="3" 
          step="0.05" 
          value={scale} 
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="w-full accent-red-600 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
        />
        <ZoomIn size={20} className="text-zinc-400" />
      </div>

      <div className="mt-6 flex gap-4">
        <button onClick={onClose} className="px-6 py-2 border border-zinc-600 text-zinc-300 hover:text-white rounded font-bold uppercase text-xs tracking-wider transition-colors">
            Cancelar
        </button>
        <button onClick={handleCrop} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase text-xs tracking-wider shadow-lg flex items-center gap-2 transition-colors">
            <Check size={16} /> Aplicar
        </button>
      </div>
    </div>
  );
};

export default CropModal;
