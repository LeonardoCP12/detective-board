import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';
import { Mail, Lock, User } from 'lucide-react';

const SignUp = ({ onSwitchToLogin, isDarkMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError('Por favor, introduce un correo electrónico válido.');
    }

    // Validar contraseñas
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);

    // Validar correo temporal con MailCheck.ai
    try {
      const mailcheckResponse = await fetch(`https://api.mailcheck.ai/email/${encodeURIComponent(email)}`);
      const mailcheckData = await mailcheckResponse.json();
      if (mailcheckData.disposable === true) {
        setLoading(false);
        return setError('No se permiten correos temporales.');
      }
    } catch (err) {
      console.error("Error al validar con MailCheck.ai:", err);
      // Si falla la API, continuamos igual
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await sendEmailVerification(userCredential.user);
      await auth.signOut();
      setSuccess('¡Cuenta creada! Te enviamos un correo de verificación. Revísalo antes de iniciar sesión.');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está en uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es muy débil (mínimo 6 caracteres).');
      } else {
        setError('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <form onSubmit={handleSignUp} className={`shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 border transition-colors duration-300 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-2xl font-bold mb-6 text-center font-mono ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>CREAR CUENTA</h2>
        {error && <p className="bg-red-900/50 text-red-300 text-xs p-3 rounded mb-4">{error}</p>}
        {success && <p className="bg-green-900/50 text-green-300 text-xs p-3 rounded mb-4">{success}</p>}
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`} htmlFor="signup-name">Nombre</label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} size={16} />
            <input className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${isDarkMode ? 'bg-zinc-700 border-zinc-600 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`} id="signup-name" type="text" placeholder="Sherlock Holmes" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`} htmlFor="signup-email">Correo</label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} size={16} />
            <input className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${isDarkMode ? 'bg-zinc-700 border-zinc-600 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`} id="signup-email" type="email" placeholder="detective@agencia.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`} htmlFor="signup-password">Contraseña</label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} size={16} />
            <input className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${isDarkMode ? 'bg-zinc-700 border-zinc-600 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`} id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>
        <div className="mb-6">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`} htmlFor="signup-confirm-password">Confirmar Contraseña</label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} size={16} />
            <input className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${isDarkMode ? 'bg-zinc-700 border-zinc-600 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`} id="signup-confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button disabled={loading} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline uppercase transition-transform active:scale-95" type="submit">
            {loading ? 'Verificando...' : 'Registrarse'}
          </button>
        </div>
      </form>
      <p className={`text-center text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
        ¿Ya tienes una cuenta?{' '}
        <a onClick={onSwitchToLogin} className="text-red-400 hover:text-red-300 font-bold cursor-pointer">Inicia sesión.</a>
      </p>
    </div>
  );
};

export default SignUp;