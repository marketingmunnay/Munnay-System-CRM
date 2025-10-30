import React, { useState } from 'react';
import { useRouter } from 'next/router'; // 👈 si usas Next.js
import LoginPage from '../components/auth/LoginPage';

const LoginContainer: React.FC = () => {
  const [error, setError] = useState('');
  const router = useRouter();

  const onLogin = async (usuario: string, password?: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://munnay-system.vercel.app'}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Usuario o contraseña incorrectos');
        return;
      }

      const data = await res.json();
      console.log('Login exitoso:', data);

      // ✅ Guardar token o datos en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(data.user));

      // ✅ Redirigir al dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <LoginPage
      onLogin={onLogin}
      error={error}
      logoUrl="/logo.png"
    />
  );
};

export default LoginContainer;
