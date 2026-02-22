import React, { useState } from 'react';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import { Sun, Moon } from 'lucide-react';

const AuthPage = () => {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
  const [isDarkMode, setIsDarkMode] = useState(true);

  const renderView = () => {
    switch (view) {
      case 'signup':
        return <SignUp onSwitchToLogin={() => setView('login')} isDarkMode={isDarkMode} />;
      case 'forgot':
        return <ForgotPassword onSwitchToLogin={() => setView('login')} isDarkMode={isDarkMode} />;
      case 'login':
      default:
        return <Login onSwitchToSignUp={() => setView('signup')} onForgotPassword={() => setView('forgot')} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`w-screen h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-zinc-900' : 'bg-gray-100'}`}>
        {/* Toggle Theme Button */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-white text-gray-600 hover:bg-gray-200 shadow-sm'}`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <h1 className={`text-5xl font-black font-mono mb-8 tracking-[0.2em] uppercase text-center ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>DETECTIVE BOARD</h1>
        <div key={view} className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-500">
            {renderView()}
        </div>
    </div>
  );
};

export default AuthPage;