import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("comprador");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !role.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || "Error al registrar.");
      } else {
        navigate("/login", {
          state: { successMessage: "¡Registro exitoso! Ahora puedes iniciar sesión." },
        });
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
        maxWidth: 400,
        margin: "40px auto",
        padding: 24,
        borderRadius: 10,
        backgroundColor: "#f9f9f9",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: 20 }}>
        Crear cuenta
      </h2>

      {error && (
        <div
          style={{
            color: "#b00020",
            backgroundColor: "#fdecea",
            padding: 10,
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label>Nombre</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Apellido</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="comprador">Comprador</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: loading ? "#aaa" : "#1976d2",
            color: "#fff",
            padding: 12,
            fontSize: 16,
            fontWeight: 600,
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>

      <p
        onClick={() => !loading && navigate("/login")}
        style={{
          marginTop: 16,
          textAlign: "center",
          color: "#1976d2",
          cursor: loading ? "not-allowed" : "pointer",
          userSelect: "none",
          textDecoration: "underline",
          fontWeight: 600,
        }}
        aria-disabled={loading}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </p>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 4,
  borderRadius: 4,
  border: "1px solid #ccc",
  fontSize: 14,
  boxSizing: "border-box",
};
