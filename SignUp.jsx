import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const SignUp = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'Este correo ya está en uso.' : 'Error al crear la cuenta.');
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <form onSubmit={handleSignUp} className="bg-zinc-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-white mb-6 text-center font-mono">CREAR CUENTA</h2>
        {error && <p className="bg-red-900/50 text-red-300 text-xs p-3 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-zinc-400 text-sm font-bold mb-2" htmlFor="signup-email">Correo</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 bg-zinc-700 border-zinc-600 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-red-500" id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-zinc-400 text-sm font-bold mb-2" htmlFor="signup-password">Contraseña</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 bg-zinc-700 border-zinc-600 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-red-500" id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block text-zinc-400 text-sm font-bold mb-2" htmlFor="signup-confirm-password">Confirmar Contraseña</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 bg-zinc-700 border-zinc-600 text-white mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500" id="signup-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline uppercase" type="submit">Registrarse</button>
        </div>
      </form>
      <p className="text-center text-zinc-500 text-xs">
        ¿Ya tienes una cuenta?{' '}
        <a onClick={onSwitchToLogin} className="text-red-400 hover:text-red-300 font-bold cursor-pointer">Inicia sesión.</a>
      </p>
    </div>
  );
};

export default SignUp;