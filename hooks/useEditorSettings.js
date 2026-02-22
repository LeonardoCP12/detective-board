// c:\Users\User\Desktop\Tablero\hooks\useEditorSettings.js
import { useState, useCallback } from 'react';

const useEditorSettings = (initialBgType) => {
  const [connectionColor, setConnectionColor] = useState('#dc2626');
  const [connectionLineType, setConnectionLineType] = useState('straight');
  const [isInteractive, setIsInteractive] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [bgType, setBgType] = useState(initialBgType);

  const toggleBackground = useCallback(() => {
    const types = ['cork', 'blackboard', 'paper'];
    setBgType(prev => types[(types.indexOf(prev) + 1) % types.length]);
  }, []);

  return {
    connectionColor, setConnectionColor,
    connectionLineType, setConnectionLineType,
    isInteractive, setIsInteractive,
    isDarkMode, setIsDarkMode,
    searchTerm, setSearchTerm,
    isSidebarOpen, setIsSidebarOpen,
    isZenMode, setIsZenMode,
    bgType, setBgType,
    toggleBackground
  };
};

export default useEditorSettings;