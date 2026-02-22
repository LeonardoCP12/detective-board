import React, { useState, useEffect } from 'react';
import { Minus, Activity, CornerDownRight } from 'lucide-react';

const InputModal = ({ isOpen, onClose, onConfirm, onDelete, title, initialValue = '', initialColor = '#dc2626', initialType, showTypeSelector = false, colorLabel = "Color", placeholder = "Escribe una relación...", isDarkMode }) => {
  const [value, setValue] = useState(initialValue);
  const [color, setColor] = useState(initialColor);
  const [type, setType] = useState(initialType || 'default');

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setColor(initialColor);
      if (initialType) setType(initialType);
    }
  }, [isOpen, initialValue, initialColor, initialType]);

  if (!isOpen) return null;

  const colors = [
    { color: '#dc2626', label: 'Rojo' },
    { color: '#3b82f6', label: 'Azul' },
    { color: '#22c55e', label: 'Verde' },
    { color: '#eab308', label: 'Amarillo' },
    { color: '#a855f7', label: 'Morado' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(value, color, type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'} border p-6 rounded-lg w-96 shadow-2xl animate-in zoom-in duration-200`}>
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'} font-mono tracking-wider mb-4`}>{title}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="input-value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-full ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-900'} border p-2 rounded focus:border-red-900 focus:ring-1 focus:ring-red-900 outline-none font-mono transition-all mb-4`}
            autoFocus
            placeholder={placeholder}
          />

          {showTypeSelector && (
            <div className="mb-4">
              <span className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} uppercase mb-2 font-mono`}>Tipo de Conexión</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setType('straight')} className={`flex-1 py-2 rounded border flex justify-center items-center transition-colors ${type === 'straight' ? (isDarkMode ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-white border-gray-400 text-black shadow-sm') : 'border-transparent text-zinc-500 hover:bg-zinc-800/50'}`} title="Recta"><Minus size={16} /></button>
                <button type="button" onClick={() => setType('default')} className={`flex-1 py-2 rounded border flex justify-center items-center transition-colors ${type === 'default' ? (isDarkMode ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-white border-gray-400 text-black shadow-sm') : 'border-transparent text-zinc-500 hover:bg-zinc-800/50'}`} title="Curva"><Activity size={16} /></button>
                <button type="button" onClick={() => setType('step')} className={`flex-1 py-2 rounded border flex justify-center items-center transition-colors ${type === 'step' ? (isDarkMode ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-white border-gray-400 text-black shadow-sm') : 'border-transparent text-zinc-500 hover:bg-zinc-800/50'}`} title="Escalonada"><CornerDownRight size={16} /></button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <span className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} uppercase mb-2 font-mono`}>{colorLabel}</span>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setColor(c.color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${color === c.color ? (isDarkMode ? 'border-white ring-zinc-400' : 'border-gray-800 ring-gray-400') + ' scale-110 ring-1' : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="text-red-600 hover:text-red-500 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Eliminar
              </button>
            ) : <div></div>}
            <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 ${isDarkMode ? 'text-zinc-400 hover:text-white border-zinc-700 hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-800 border-gray-300 hover:bg-gray-100'} text-xs font-bold uppercase tracking-wider transition-colors border rounded`}
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

export default InputModal;
