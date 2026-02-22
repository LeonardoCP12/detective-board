import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';

const Login = ({ onSwitchToSignUp, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Error al iniciar sesión con Google.');
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <form onSubmit={handleLogin} className="bg-zinc-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-white mb-6 text-center font-mono">INICIAR SESIÓN</h2>
        {error && <p className="bg-red-900/50 text-red-300 text-xs p-3 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-zinc-400 text-sm font-bold mb-2" htmlFor="login-email">Correo</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 bg-zinc-700 border-zinc-600 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-red-500" id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block text-zinc-400 text-sm font-bold mb-2" htmlFor="login-password">Contraseña</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 bg-zinc-700 border-zinc-600 text-white mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500" id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline uppercase" type="submit">Entrar</button>
          <button onClick={handleGoogleLogin} type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline uppercase">Entrar con Google</button>
        </div>
        <div className="text-center mt-6">
          <a onClick={onForgotPassword} className="inline-block align-baseline font-bold text-sm text-blue-400 hover:text-blue-300 cursor-pointer">¿Olvidaste tu contraseña?</a>
        </div>
      </form>
      <p className="text-center text-zinc-500 text-xs">
        ¿No tienes cuenta?{' '}
        <a onClick={onSwitchToSignUp} className="text-red-400 hover:text-red-300 font-bold cursor-pointer">Regístrate aquí.</a>
      </p>
    </div>
  );
};

export default Login;