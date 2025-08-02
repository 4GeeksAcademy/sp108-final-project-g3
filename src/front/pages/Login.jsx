import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Función para decodificar el payload del JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();  // Usamos el global reducer para actualizar estado global

  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
      // Limpiar el estado para que no muestre el mensaje tras refrescar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Validar email básico
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Manejador de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || "Correo o contraseña incorrectos");
      } else {
        // Guarda el token en localStorage
        localStorage.setItem("token", data.access_token);

        // Extrae el payload del token
        const payload = parseJwt(data.access_token);

        if (payload && payload.role) {
          // Guarda info de usuario en localStorage para persistencia
          localStorage.setItem("role", payload.role);
          localStorage.setItem("first_name", payload.first_name || "");
          localStorage.setItem("last_name", payload.last_name || "");
          localStorage.setItem("email", payload.email || "");

          // Actualiza estado global con los datos del usuario
          dispatch({
            type: "LOGIN",
            payload: {
              role: payload.role,
              first_name: payload.first_name,
              last_name: payload.last_name,
              email: payload.email,
              token: data.access_token,
            }
          });

          // Redirige al dashboard
          navigate("/dashboard");
        } else {
          setError("No se pudo obtener la información del usuario.");
        }
      }
    } catch (err) {
      setError("Error de conexión. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 360,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 2px 10px rgb(0 0 0 / 0.1)",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>
        Iniciar sesión
      </h2>

      {error && (
        <div
          style={{
            marginBottom: 15,
            color: "#d32f2f",
            backgroundColor: "#fddede",
            padding: "10px 15px",
            borderRadius: 4,
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: 15,
            color: "#2e7d32",
            backgroundColor: "#d0f0d9",
            padding: "10px 15px",
            borderRadius: 4,
          }}
          role="alert"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            placeholder="tuemail@ejemplo.com"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              marginBottom: 16,
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: 14,
            }}
            disabled={loading}
          />
        </label>

        <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              marginBottom: 20,
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: 14,
            }}
            disabled={loading}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: loading ? "#999" : "#1976d2",
            color: "#fff",
            padding: 12,
            fontSize: 16,
            fontWeight: "600",
            borderRadius: 4,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
