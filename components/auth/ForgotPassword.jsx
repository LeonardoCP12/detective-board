import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { Mail } from 'lucide-react';

const ForgotPassword = ({ onSwitchToLogin, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('¡Revisa tu correo! Se ha enviado un enlace para restablecer tu contraseña.');
    } catch (err) {
      setError('Error al enviar el correo. Verifica que la dirección sea correcta.');
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <form onSubmit={handleReset} className={`shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 border transition-colors duration-300 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-2xl font-bold mb-6 text-center font-mono ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>RECUPERAR CONTRASEÑA</h2>
        {error && <p className="bg-red-900/50 text-red-300 text-xs p-3 rounded mb-4">{error}</p>}
        {message && <p className="bg-green-900/50 text-green-300 text-xs p-3 rounded mb-4">{message}</p>}
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`} htmlFor="reset-email">Correo Electrónico</label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} size={16} />
            <input className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${isDarkMode ? 'bg-zinc-700 border-zinc-600 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`} id="reset-email" type="email" placeholder="detective@agencia.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline uppercase transition-transform active:scale-95" type="submit">Enviar Enlace</button>
        </div>
      </form>
      <p className={`text-center text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
        <a onClick={onSwitchToLogin} className="text-red-400 hover:text-red-300 font-bold cursor-pointer">Volver a Iniciar Sesión</a>
      </p>
    </div>
  );
};

export default ForgotPassword;