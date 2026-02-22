import React, { memo, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, NodeResizer, useReactFlow } from 'reactflow';
import { Image as ImageIcon, X, Pin, PinOff, RotateCw, RotateCcw, Crop, Eraser, SlidersHorizontal } from 'lucide-react';
import CropModal from './CropModal';
import { processImage } from '../utils/imageUtils';
import Stamp from './Stamp';

const ImageNode = ({ id, data, selected, isDarkMode }) => {
  const [src, setSrc] = useState(data.image);
  const [showFullImage, setShowFullImage] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(data.filters || { brightness: 100, contrast: 100, grayscale: 0, sepia: 0 });
  const { deleteElements, setNodes, getNode } = useReactFlow();
  const isLocked = !!data.locked;
  const rotation = useMemo(() => Math.floor(Math.random() * 40) - 20, [data.status]);

  useEffect(() => {
    if (data.filters) {
        setFilters(data.filters);
    }
  }, [data.filters]);

  // Intentar convertir imágenes externas a Base64 automáticamente para evitar errores de CORS al exportar
  useEffect(() => {
    if (data.image && data.image.startsWith('http')) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = data.image;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg');
          
          // Si la conversión fue exitosa, actualizamos el estado y el nodo
          if (dataURL.length > 100) {
            setSrc(dataURL);
            setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, image: dataURL } } : n));
          }
        } catch (e) {
          // Si falla por CORS estricto, no podemos hacer nada, se queda como URL
        }
      };
    }
  }, []); // Se ejecuta solo al montar el componente

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

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file, (compressedImage, width, height) => {
        setSrc(compressedImage);
        // Actualización inmutable correcta
        setNodes((nds) => nds.map((n) => {
          if (n.id === id) {
            return { ...n, data: { ...n.data, image: compressedImage }, style: { ...n.style, width, height } };
          }
          return n;
        }));
      });
    }
  };

  const handleRotate = (direction) => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(direction === 'right' ? 90 * Math.PI / 180 : -90 * Math.PI / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      const newSrc = canvas.toDataURL();
      setSrc(newSrc);
      
      // Actualizamos la imagen y las dimensiones del nodo (swap width/height)
      const node = getNode(id);
      const currentWidth = node?.style?.width;
      const currentHeight = node?.style?.height;

      setNodes((nds) => nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: { ...n.data, image: newSrc },
            style: { ...n.style, width: currentHeight, height: currentWidth }
          };
        }
        return n;
      }));
    };
  };

  const handleCrop = () => {
    setCropModalOpen(true);
  };

  const onCropComplete = (newImage) => {
    setSrc(newImage);
    // Actualizamos la imagen y reseteamos el tamaño a cuadrado (ya que el recorte es cuadrado)
    setNodes((nds) => nds.map((n) => {
        if (n.id === id) {
            return { 
                ...n, 
                data: { ...n.data, image: newImage },
                style: { ...n.style, width: 300, height: 300 } 
            };
        }
        return n;
    }));
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

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, filters: newFilters } } : n));
  };

  return (
    <>
      <NodeResizer color="#ef4444" isVisible={selected && !isLocked} minWidth={100} minHeight={100} handleStyle={{ width: 15, height: 15 }} />
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

      {/* Barra de Herramientas de Imagen (Rotar/Recortar) */}
      {selected && !isLocked && src && (
        <div className={`nodrag absolute -bottom-9 left-1/2 transform -translate-x-1/2 flex gap-1 p-1.5 rounded-full shadow-xl border z-50 backdrop-blur-sm items-center ${isDarkMode ? 'bg-zinc-900/90 border-zinc-700' : 'bg-white/90 border-gray-200'}`}>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-1.5 rounded-full transition-colors ${showFilters ? 'bg-blue-600 text-white' : (isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-700' : 'text-zinc-500 hover:text-black hover:bg-gray-200')}`} title="Filtros">
            <SlidersHorizontal size={14} />
          </button>
          <div className={`w-px h-4 mx-0.5 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
          <button onClick={() => handleRotate('left')} className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-700' : 'text-zinc-500 hover:text-black hover:bg-gray-200'}`} title="Rotar Izquierda">
            <RotateCcw size={14} />
          </button>
          <button onClick={handleCrop} className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-700' : 'text-zinc-500 hover:text-black hover:bg-gray-200'}`} title="Recortar">
            <Crop size={14} />
          </button>
          <button onClick={() => handleRotate('right')} className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-700' : 'text-zinc-500 hover:text-black hover:bg-gray-200'}`} title="Rotar Derecha">
            <RotateCw size={14} />
          </button>
          {data.status && (
             <button onClick={removeStamp} className={`p-1.5 text-red-500 hover:text-red-400 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'}`} title="Quitar Sello">
               <Eraser size={14} />
             </button>
          )}
        </div>
      )}
      
      {/* Panel de Filtros */}
      {showFilters && selected && !isLocked && (
        <div className={`nodrag absolute -bottom-44 left-1/2 transform -translate-x-1/2 p-3 rounded-lg border z-50 w-48 backdrop-blur-sm flex flex-col gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 ${isDarkMode ? 'bg-zinc-900/95 border-zinc-700' : 'bg-white/95 border-gray-200'}`}>
            <div className={`flex items-center justify-between text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <span>Brillo</span> <span>{filters.brightness}%</span>
            </div>
            <input type="range" min="0" max="200" value={filters.brightness} onChange={(e) => updateFilter('brightness', parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-blue-500 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center justify-between text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <span>Contraste</span> <span>{filters.contrast}%</span>
            </div>
            <input type="range" min="0" max="200" value={filters.contrast} onChange={(e) => updateFilter('contrast', parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-blue-500 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center justify-between text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <span>B/N</span> <span>{filters.grayscale}%</span>
            </div>
            <input type="range" min="0" max="100" value={filters.grayscale} onChange={(e) => updateFilter('grayscale', parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-blue-500 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center justify-between text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <span>Sepia</span> <span>{filters.sepia}%</span>
            </div>
            <input type="range" min="0" max="100" value={filters.sepia} onChange={(e) => updateFilter('sepia', parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-blue-500 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`} />
        </div>
      )}

      {/* Cinta Adhesiva Visual */}
      <div className="tape-visual" />

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
      
      <div className={`h-full w-full ${src ? 'bg-zinc-100 p-2 pb-10 rotate-1 hover:rotate-0' : (isDarkMode ? 'bg-zinc-900/50 border-zinc-700 hover:border-zinc-500' : 'bg-gray-200/50 border-gray-400 hover:border-gray-500')} shadow-[0_10px_20px_-5px_rgba(0,0,0,0.7)] flex items-center justify-center overflow-hidden rounded-sm relative group transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] ${isLocked ? 'nodrag' : ''} ${data.isDeleting ? 'deleting-image' : ''} border-2 border-dashed`}>
        {!src ? (
          <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-1">
            <label className={`nodrag cursor-pointer flex flex-col items-center gap-1 transition-colors ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700'}`}>
              <ImageIcon size={24} />
              <span className="text-[10px] font-mono uppercase text-center">Subir Local</span>
              <input type="file" name="upload-image" className="hidden" accept="image/*" onChange={handleUpload} />
            </label>
            <div className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>- O -</div>
            <input 
              type="text" 
              name="image-url"
              placeholder="Pegar URL..." 
              className={`nodrag w-full border text-[10px] p-1 rounded outline-none focus:border-purple-500 font-mono text-center ${isDarkMode ? 'bg-zinc-950 border-zinc-700 text-zinc-300' : 'bg-white border-gray-300 text-zinc-700'}`}
              onKeyDown={(e) => { 
                if (e.key === 'Enter') { 
                  const url = e.currentTarget.value;
                  setSrc(url); 
                  data.image = url;

                  // Intentar convertir a DataURL inmediatamente
                  const img = new Image();
                  img.crossOrigin = "Anonymous";
                  img.onload = () => {
                    try {
                      const canvas = document.createElement('canvas');
                      canvas.width = img.width;
                      canvas.height = img.height;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(img, 0, 0);
                      const dataURL = canvas.toDataURL('image/jpeg');
                      setSrc(dataURL);
                      setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, image: dataURL } } : n));
                    } catch (e) { console.warn("CORS blocked", e); }
                  };
                  img.src = url;
                } 
              }}
            />
          </div>
        ) : (
          <div 
            className="w-full h-full cursor-zoom-in"
            onClick={(e) => {
              e.stopPropagation();
              setShowFullImage(true);
            }}
          >
            <img src={src} alt="evidence" className="w-full h-full object-cover border border-zinc-200" style={{ filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)` }} />
            
            {/* Leyenda estilo Polaroid */}
            <div className="absolute bottom-0 left-0 w-full h-10 flex items-center justify-center px-2">
                <input 
                    type="text" 
                    name="image-caption"
                    className="nodrag w-full bg-transparent text-center text-zinc-800 text-xs outline-none placeholder-zinc-400/50 border-none p-0"
                    placeholder=""
                    defaultValue={data.caption}
                    onChange={(e) => data.caption = e.target.value}
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive' }}
                />
            </div>
          </div>
        )}
      </div>

      {/* Visor de Imagen HD */}
      {showFullImage && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-8 cursor-zoom-out backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { e.stopPropagation(); setShowFullImage(false); }}
        >
          <img src={src} alt="Evidence HD" className="max-w-full max-h-full object-contain shadow-2xl rounded-sm" style={{ filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)` }} />
        </div>,
        document.body
      )}

      {/* Modal de Recorte */}
      {cropModalOpen && createPortal(
        <CropModal 
            isOpen={cropModalOpen} 
            onClose={() => setCropModalOpen(false)} 
            imageSrc={src} 
            onCropComplete={onCropComplete} 
        />,
        document.body
      )}
    </>
  );
};
export default memo(ImageNode);