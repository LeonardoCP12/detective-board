// c:\Users\User\Desktop\Tablero\components\UrlNode.jsx
import React, { memo, useState, useEffect, useMemo } from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from 'reactflow';
import { Link, ExternalLink, X, Pin, PinOff, Edit2, Globe, RefreshCw, Monitor } from 'lucide-react';

const UrlNode = ({ id, data, selected, isDarkMode }) => {
  const { deleteElements, setNodes } = useReactFlow();
  const [urlInput, setUrlInput] = useState(data.url || '');
  const [isEditing, setIsEditing] = useState(!data.url);
  const showIframe = !!data.showIframe;
  const [iframeLoaded, setIframeLoaded] = useState(false); // Nuevo estado para controlar la carga del iframe
  const [refreshKey, setRefreshKey] = useState(0);
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(true);
  const [imageError, setImageError] = useState(false);
  const isLocked = !!data.locked;

  // Detectar y transformar enlaces de YouTube para embed
  const embedUrl = useMemo(() => {
    if (!data.url) return '';
    try {
      const urlObj = new URL(data.url);
      const isYoutube = urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
      
      if (isYoutube) {
        let videoId = null;
        if (urlObj.hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.slice(1);
        } else if (urlObj.searchParams.has('v')) {
          videoId = urlObj.searchParams.get('v');
        } else if (urlObj.pathname.startsWith('/embed/')) {
          return data.url;
        }

        if (videoId) {
          return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&controls=1&playsinline=1&loop=1&playlist=${videoId}`;
        }
      }
    } catch (e) {
      // URL inválida, ignorar
    }
    return data.url;
  }, [data.url]);

  // Construimos la URL base de mshots
  const mshotsUrl = data.url ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(data.url)}?w=400&v=${refreshKey}` : null;
  // Usamos wsrv.nl DIRECTAMENTE como primera opción para evitar el intento fallido y el error en consola
  const defaultThumbnailUrl = mshotsUrl ? `https://wsrv.nl/?url=${encodeURIComponent(mshotsUrl)}` : null;

  useEffect(() => {
    setThumbnailSrc(null);
    if (!defaultThumbnailUrl) return;

    const loadImage = (url) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.referrerPolicy = 'no-referrer';
      img.src = url;
      img.onload = () => {
        try {
        
        const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg');
          setThumbnailSrc(dataURL);
          setIsLoadingThumbnail(false);
        } catch (e) {
          setIsLoadingThumbnail(false);
          setImageError(true);
        }
      };
      img.onerror = () => {
        setIsLoadingThumbnail(false);
        setImageError(true);
      };
    };

    loadImage(defaultThumbnailUrl);
  }, [defaultThumbnailUrl]);

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

  const handleSave = () => {
    let finalUrl = urlInput;
    if (finalUrl && !finalUrl.startsWith('http')) {
        finalUrl = 'https://' + finalUrl;
    }
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, url: finalUrl, showIframe: false } };
        }
        return n;
      })
    );
    setIsEditing(false);
    setIframeLoaded(false); // Reiniciar el estado de carga del iframe
    setImageError(false);
    setIsLoadingThumbnail(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIframeLoaded(false);
    setImageError(false);
    setIsLoadingThumbnail(true);
  };

  const refreshThumbnail = (e) => {
    e.stopPropagation();
    setRefreshKey(prev => prev + 1);
    setIframeLoaded(false); // Reiniciar el estado de carga del iframe
    setImageError(false);
    setIsLoadingThumbnail(true);
  };

  const handleToggleIframe = () => {
    const newState = !showIframe;
    setIframeLoaded(false); // Reiniciar el estado de carga del iframe al alternar
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, showIframe: newState } };
        }
        return n;
      })
    );
  };

  return (
    <>
      <NodeResizer color="#3b82f6" isVisible={selected && !isLocked} minWidth={200} minHeight={100} />
      
      {selected && (
        <button 
          onClick={() => deleteElements({ nodes: [{ id }] })}
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

      {/* Handles */}
      <div className="absolute -top-3 w-4 h-4 z-50" style={{ left: 'calc(50% - 8px)' }}>
        <div className="w-full h-full rounded-full pin-3d pointer-events-none" />
        <Handle type="target" position={Position.Top} style={{ position: 'absolute', top: '7px', left: '7px', width: '2px', height: '2px', opacity: 0, background: 'transparent', border: 'none' }} />
        <Handle type="source" position={Position.Top} style={{ position: 'absolute', top: '7px', left: '7px', width: '2px', height: '2px', opacity: 0, background: 'transparent', border: 'none' }} />
      </div>

      <div className={`relative w-full h-full rounded-lg overflow-hidden border-2 transition-all shadow-lg flex flex-col ${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'} ${isLocked ? 'nodrag' : ''} ${data.isDeleting ? 'deleting-default' : ''}`}>
        
        {/* Header */}
        <div className={`h-8 flex items-center px-2 gap-2 border-b ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-200'}`}>
            <Globe size={14} className="text-blue-500" />
            <span className={`text-[10px] font-mono truncate flex-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                {data.url ? new URL(data.url).hostname : 'ENLACE WEB'}
            </span>
            {!isEditing && (
                <div className="flex gap-1">
                    <button onClick={handleToggleIframe} className={`text-zinc-500 transition-colors ${showIframe ? 'text-blue-500' : 'hover:text-blue-500'}`} title={showIframe ? "Ver miniatura" : "Ver interactivo"}><Monitor size={12} /></button>
                    <button onClick={refreshThumbnail} className="text-zinc-500 hover:text-green-500 transition-colors" title="Actualizar miniatura"><RefreshCw size={12} /></button>
                    <button onClick={handleEdit} className="text-zinc-500 hover:text-blue-500 transition-colors"><Edit2 size={12} /></button>
                </div>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-black/5 group">
            {isEditing ? (
                <div className="p-4 flex flex-col gap-2 h-full justify-center">
                    <input 
                        type="text" 
                        name="url-input"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://ejemplo.com"
                        className={`nodrag w-full text-xs p-2 rounded border outline-none font-mono ${isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <button onClick={handleSave} className="bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-500 font-bold uppercase">Guardar</button>
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col">
                    {/* Content View (Iframe or Thumbnail) */}
                    <div className="flex-1 relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 min-h-0">
                        {showIframe ? (
                            <>
                                <div className={`absolute top-0 left-0 w-full py-1 px-2 flex flex-col gap-1 items-center justify-center z-20 ${isDarkMode ? 'bg-zinc-950/80' : 'bg-white/80'} backdrop-blur-[2px]`}>
                                    <span className={`text-[9px] leading-tight text-center select-none ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                        Si no carga, el sitio bloquea la conexión.
                                    </span>
                                </div>
                                <iframe 
                                    key={refreshKey}
                                    src={embedUrl} 
                                    className="w-full h-full border-none relative z-10 bg-white" 
                                    title="Embedded Content" 
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-modals allow-popups-to-escape-sandbox"
                                    onError={(e) => {
                                        console.warn('Error loading iframe:', data.url);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </>
                        ) : (
                            <>
                                {isLoadingThumbnail && data.url && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20">
                                        <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                {thumbnailSrc && !imageError && (
                                    <img 
                                        src={thumbnailSrc} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                                    />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                     {(!data.url || imageError) && <Link size={32} className="text-zinc-400" />}
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Footer Action */}
                    <a 
                        href={data.url} 
                        target="_blank" 
                        rel="noopener"
                        draggable="false"
                        onDragStart={(e) => e.preventDefault()}
                        className={`nodrag h-10 shrink-0 flex items-center justify-center gap-2 text-xs font-bold uppercase transition-colors z-10 relative ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-blue-400' : 'bg-gray-200 hover:bg-gray-300 text-zinc-900'}`}
                    >
                        <ExternalLink size={14} /> Visitar Sitio
                    </a>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default memo(UrlNode);
