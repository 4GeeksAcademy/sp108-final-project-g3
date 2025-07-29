import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function Login({ onLoginSuccess }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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
        setSuccess("¡Bienvenido!");
        onLoginSuccess && onLoginSuccess(data.access_token);
      }
    } catch (err) {
      setError("Error de conexión. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
          {loading ? (
            <span
              style={{
                display: "inline-block",
                width: 20,
                height: 20,
                border: "3px solid #fff",
                borderTop: "3px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      <p
        onClick={() => !loading && navigate("/register")}
        style={{
          marginTop: 20,
          textAlign: "center",
          color: "#1976d2",
          cursor: loading ? "not-allowed" : "pointer",
          userSelect: "none",
          textDecoration: "underline",
          fontWeight: 600,
        }}
        aria-disabled={loading}
      >
        ¿No tienes cuenta? Regístrate
      </p>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
