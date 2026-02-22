import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

const ForgotPassword = ({ onSwitchToLogin }) => {
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
      <form onSubmit={handleReset} className="bg-zinc-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-white mb-6 text-center font-mono">RECUPERAR CONTRASEÑA</h2>
        {error && <p className="bg-red-900/50 text-red-300 text-xs p-3 rounded mb-4">{error}</p>}
        {message && <p className="bg-green-900/50 text-green-300 text-xs p-3 rounded mb-4">{message}</p>}
        <div className="mb-4">
          <label className="block text-zinc-400 text-sm font-bold mb-2" htmlFor="reset-email">Correo Electrónico</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 bg-zinc-700 border-zinc-600 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-red-500" id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline uppercase" type="submit">Enviar Enlace</button>
        </div>
      </form>
      <p className="text-center text-zinc-500 text-xs">
        <a onClick={onSwitchToLogin} className="text-red-400 hover:text-red-300 font-bold cursor-pointer">Volver a Iniciar Sesión</a>
      </p>
    </div>
  );
};

export default ForgotPassword;