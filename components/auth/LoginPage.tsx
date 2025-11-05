import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "../shared/Icons.tsx";

interface LoginPageProps {
  onLogin: (usuario: string, password?: string) => void;
  error: string;
  logoUrl?: string;
  loginImageUrl?: string;
}

// Use Vite environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error, logoUrl, loginImageUrl }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const defaultImage =
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2070";
  const finalLoginImageUrl = loginImageUrl || defaultImage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Send plain text password - backend handles bcrypt hashing
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await res.json();
      console.log("Login exitoso:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      onLogin(username, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error en login:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${finalLoginImageUrl})` }}
    >
      {/* ... resto del JSX igual ... */}
    </div>
  );
};

export default LoginPage;
