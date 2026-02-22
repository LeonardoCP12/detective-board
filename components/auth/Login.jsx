import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { Mail, Lock } from 'lucide-react';

const Login = ({ onSwitchToSignUp, onForgotPassword, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setError('Error: ' + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/cancelled-popup-request') {
        setError(''); // Ignorar si el usuario cerró la ventana voluntariamente
      } else {
        setError('Error Google: ' + err.message);
      }
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <form onSubmit={handleLogin} className={`shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 border transition-colors duration-300 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-2xl font-bold mb-6 text-center font-mono ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>INICIAR SESIÓN</h2>
        {error && <p className="bg-red-900/50 text-red-300 text-xs p-3 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`} htmlFor="login-email">Correo</label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} size={16} />
            <input className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${isDarkMode ? 'bg-zinc-700 border-zinc-600 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`} id="login-email" type="email" placeholder="detective@agencia.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="mb-6">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`} htmlFor="login-password">Contraseña</label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} size={16} />
            <input className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${isDarkMode ? 'bg-zinc-700 border-zinc-600 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`} id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline uppercase transition-transform active:scale-95" type="submit">Entrar</button>
          
          <div className="relative flex py-1 items-center">
            <div className={`flex-grow border-t ${isDarkMode ? 'border-zinc-600' : 'border-gray-300'}`}></div>
            <span className={`flex-shrink mx-2 text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>O</span>
            <div className={`flex-grow border-t ${isDarkMode ? 'border-zinc-600' : 'border-gray-300'}`}></div>
          </div>

          <button onClick={handleGoogleLogin} type="button" className={`flex items-center justify-center gap-3 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all active:scale-95 ${isDarkMode ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </div>
        <div className="text-center mt-6">
          <a onClick={onForgotPassword} className="inline-block align-baseline font-bold text-sm text-blue-400 hover:text-blue-300 cursor-pointer">¿Olvidaste tu contraseña?</a>
        </div>
      </form>
      <p className={`text-center text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
        ¿No tienes cuenta?{' '}
        <a onClick={onSwitchToSignUp} className="text-red-400 hover:text-red-300 font-bold cursor-pointer">Regístrate aquí.</a>
      </p>
    </div>
  );
};

export default Login;