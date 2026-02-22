import React, { useState, useEffect } from 'react';
import { X, Eraser } from 'lucide-react';

const EditModal = ({ isOpen, onClose, node, onSave, onDelete, isDarkMode }) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('clue');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Cargar datos del nodo cuando se abre el modal
  useEffect(() => {
    if (node) {
      setLabel(node.data.label || '');
      setDescription(node.data.description || '');
      setImage(node.data.image || '');
      setCategory(node.data.category || 'clue');
      setShowDeleteConfirm(false);
    }
  }, [node]);

  if (!isOpen) return null;

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm">
        <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-white'} border border-red-900/50 p-6 rounded-lg w-96 shadow-2xl animate-in fade-in zoom-in duration-200 text-center`}>
          <h2 className="text-xl font-bold text-red-500 font-mono tracking-wider mb-4">¿ELIMINAR EVIDENCIA?</h2>
          <p className={`${isDarkMode ? 'text-zinc-400' : 'text-gray-600'} text-sm font-mono mb-6`}>Esta acción es irreversible. ¿Estás seguro?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className={`px-4 py-2 ${isDarkMode ? 'text-zinc-400 hover:text-white border-zinc-700 hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-800 border-gray-300 hover:bg-gray-100'} text-xs font-bold uppercase tracking-wider transition-colors border rounded`}
            >
              Cancelar
            </button>
            <button
              onClick={() => onDelete(node.id)}
              className="px-6 py-2 bg-red-900/80 hover:bg-red-800 text-red-100 text-xs font-bold uppercase tracking-wider rounded shadow-lg border border-red-900 transition-all"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Guardamos los datos manteniendo el resto de propiedades del nodo
    onSave(node.id, { ...node.data, label, description, image, category });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'} border p-6 rounded-lg w-96 shadow-2xl animate-in fade-in zoom-in duration-200`}>
        <div className={`flex justify-between items-center mb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'} pb-2`}>
          <h2 className="text-xl font-bold text-red-500 font-mono tracking-wider">EDITAR EVIDENCIA</h2>
          <button onClick={onClose} className={`${isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'} transition-colors`}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="evidence-category" className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} uppercase mb-1 font-mono`}>Categoría</label>
            <select
              id="evidence-category"
              name="evidence-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-900'} border p-2 rounded focus:border-red-900 focus:ring-1 focus:ring-red-900 outline-none font-mono transition-all text-sm`}
            >
              <option value="person">Sospechoso</option>
              <option value="place">Lugar</option>
              <option value="clue">Pista</option>
              <option value="event">Evento</option>
            </select>
          </div>

          <div>
            <label htmlFor="evidence-title" className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} uppercase mb-1 font-mono`}>Título</label>
            <input
              id="evidence-title"
              type="text"
              name="evidence-title"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={`w-full ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-900'} border p-2 rounded focus:border-red-900 focus:ring-1 focus:ring-red-900 outline-none font-mono transition-all`}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="evidence-description" className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} uppercase mb-1 font-mono`}>Descripción</label>
            <textarea
              id="evidence-description"
              name="evidence-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`w-full ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'} border p-2 rounded focus:border-red-900 focus:ring-1 focus:ring-red-900 outline-none font-mono text-sm resize-none transition-all`}
            />
          </div>

          <div>
            <label htmlFor="evidence-image-url" className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} uppercase mb-1 font-mono`}>Imagen (URL o Local)</label>
            <div className="space-y-2">
              <input
                id="evidence-image-url"
                type="text"
                name="evidence-image-url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className={`w-full ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-600'} border p-2 rounded focus:border-red-900 outline-none font-mono text-xs`}
              />
              <div className={`text-[10px] ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'} text-center font-mono uppercase tracking-widest`}>- O -</div>
              <label className={`flex items-center justify-center w-full p-2 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200' : 'bg-gray-50 border-gray-300 hover:border-gray-400 hover:text-gray-800'} border border-dashed rounded cursor-pointer transition-colors group`}>
                <span className={`text-xs ${isDarkMode ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-gray-500 group-hover:text-gray-700'} font-mono uppercase`}>Subir archivo local</span>
                <input 
                  type="file" 
                  name="evidence-image-file"
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => setImage(event.target.result);
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </label>
            </div>
          </div>

          {/* Remove Stamp Button */}
          {node.data.status && (
            <div className={`flex justify-end pt-2 border-t ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
               <button type="button" onClick={() => { onSave(node.id, { ...node.data, status: null }); onClose(); }} 
                  className="text-[10px] flex items-center gap-1 text-orange-500 hover:text-orange-400 uppercase font-bold tracking-wider"
               >
                  <Eraser size={12}/> Quitar Sello
               </button>
            </div>
          )}

          <div className={`flex justify-between items-center mt-6 pt-4 border-t ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-500 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Eliminar
            </button>
            <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'} text-xs font-bold uppercase tracking-wider transition-colors`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-900/80 hover:bg-red-800 text-red-100 text-xs font-bold uppercase tracking-wider rounded shadow-lg border border-red-900 transition-all"
            >
              Guardar
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;