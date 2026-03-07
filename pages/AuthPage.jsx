import React, { useState } from 'react';
import Login from '../components/auth/Login';
import { Sun, Moon } from 'lucide-react';

const AuthPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={`w-screen h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-zinc-900' : 'bg-gray-100'}`}>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-white text-gray-600 hover:bg-gray-200 shadow-sm'}`}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <h1 className={`text-5xl font-black font-mono mb-8 tracking-[0.2em] uppercase text-center ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
        DETECTIVE BOARD
      </h1>

      <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-500">
        <Login isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default AuthPage;