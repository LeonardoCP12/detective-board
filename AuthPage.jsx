import React, { useState } from 'react';
import Login from '../components/auth/Login';
import SignUp from '../components/auth/SignUp';
import ForgotPassword from '../components/auth/ForgotPassword';

const AuthPage = () => {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'

  const renderView = () => {
    switch (view) {
      case 'signup':
        return <SignUp onSwitchToLogin={() => setView('login')} />;
      case 'forgot':
        return <ForgotPassword onSwitchToLogin={() => setView('login')} />;
      case 'login':
      default:
        return <Login onSwitchToSignUp={() => setView('signup')} onForgotPassword={() => setView('forgot')} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-zinc-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-black text-zinc-500 font-mono mb-4 tracking-[0.2em] uppercase">DETECTIVE BOARD</h1>
        {renderView()}
    </div>
  );
};

export default AuthPage;