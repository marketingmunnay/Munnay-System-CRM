import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '../shared/Icons.tsx';

interface LoginPageProps {
  onLogin: (username: string, password?: string) => void;
  error: string;
  logoUrl?: string;
  loginImageUrl?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error, logoUrl, loginImageUrl }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const defaultImage = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2070';
  const finalLoginImageUrl = loginImageUrl || defaultImage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    onLogin(username, password);
    // No need to setIsSubmitting(false) as the component will unmount on successful login.
  };

  return (
    <div 
        className="min-h-screen bg-cover bg-center" 
        style={{ backgroundImage: `url(${finalLoginImageUrl})` }}
    >
        <div className="min-h-screen bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center p-4">
            <main className="w-full max-w-4xl lg:max-w-5xl flex bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">
                {/* Form Section */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    <div className="w-full">
                        {logoUrl && <img className="h-12 mb-8" src={logoUrl} alt="Munnay Logo" />}
                        <h1 className="text-3xl font-bold text-black tracking-tight">Bienvenido de vuelta</h1>
                        <p className="text-gray-600 mt-2">Por favor, ingresa tus credenciales para continuar.</p>

                        {error && (
                            <div className="bg-red-50 p-3 rounded-md mt-6">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Usuario
                                </label>
                                <div className="mt-1">
                                    <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    placeholder="Ingresa tu usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg shadow-sm placeholder-black text-black focus:outline-none focus:ring-[#aa632d] focus:border-[#aa632d] sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg shadow-sm placeholder-black text-black focus:outline-none focus:ring-[#aa632d] focus:border-[#aa632d] sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#aa632d] focus:ring-[#8e5225] border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Recordarme
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-[#aa632d] hover:text-[#8e5225]">
                                    ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 transition-colors"
                                >
                                    {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Image Section */}
                <div className="hidden lg:block lg:w-1/2">
                    <img src={finalLoginImageUrl} className="w-full h-full object-cover" alt="Scenery"/>
                </div>
            </main>
        </div>
    </div>
  );
};

export default LoginPage;