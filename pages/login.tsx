import React, { useState } from "react";
import { useRouter } from "next/router";
import LoginPage from "../components/auth/LoginPage";

const LoginContainer: React.FC = () => {
  const [error, setError] = useState("");
  const router = useRouter();

  const onLogin = async (username: string, password?: string) => {
    try {
      // Use Vite environment variable
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      // Send plain text password - backend handles bcrypt hashing
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });


      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Usuario o contraseña incorrectos");
        return;
      }

      const data = await res.json();
      console.log("Login exitoso:", data);

      // ✅ Guardar token o datos en localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // ✅ Redirigir al dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error de conexión con el servidor");
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
