import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", isDanger = false, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[300] backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-white'} border ${isDanger ? 'border-red-900/50' : (isDarkMode ? 'border-zinc-700' : 'border-gray-200')} p-6 rounded-lg w-96 shadow-2xl animate-in zoom-in duration-200 text-center`}>
        <h2 className={`text-xl font-bold ${isDanger ? 'text-red-500' : (isDarkMode ? 'text-zinc-100' : 'text-gray-800')} font-mono tracking-wider mb-4`}>{title}</h2>
        <p className={`${isDarkMode ? 'text-zinc-400' : 'text-gray-600'} text-sm font-mono mb-6`}>{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 ${isDarkMode ? 'text-zinc-400 hover:text-white border-zinc-700 hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-800 border-gray-300 hover:bg-gray-100'} text-xs font-bold uppercase tracking-wider transition-colors border rounded`}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-6 py-2 ${isDanger ? 'bg-red-900/80 hover:bg-red-800 text-red-100 border-red-900' : 'bg-blue-900/80 hover:bg-blue-800 text-blue-100 border-blue-900'} text-xs font-bold uppercase tracking-wider rounded shadow-lg border transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;