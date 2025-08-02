import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Dashboard() {
  const { store } = useGlobalReducer();
  const user = store.user;

  // Si no hay usuario logueado
  if (!user || !user.role) {
    return (
      <div className="container text-center mt-5">
        <h3>Rol desconocido</h3>
        <p>Tu rol no tiene acceso a este dashboard.</p>
      </div>
    );
  }

  const { role, first_name = "", last_name = "", email = "" } = user;

  // Componente botón sidebar con icono y hover en verdes estilo Wallapop
  const SidebarButton = ({ iconClass, children }) => {
    const [hover, setHover] = useState(false);

    return (
      <button
        style={{
          padding: "10px 15px",
          backgroundColor: hover ? "#c6f6d5" : "#e6f4ea", // verde claro hover / fondo normal
          border: "1px solid #34a853", // verde medio para borde
          borderRadius: 5,
          color: "#2f855a", // verde oscuro para texto
          cursor: "pointer",
          fontWeight: "600",
          textAlign: "left",
          transition: "background-color 0.2s ease",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: "15px",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <i className={iconClass} style={{ minWidth: 20, textAlign: "center", color: "#2f855a" }}></i>
        {children}
      </button>
    );
  };

  if (role === "comprador") {
    return (
      <div className="container mt-5" style={{ display: "flex", gap: "30px" }}>
        {/* Sidebar a la izquierda */}
        <aside
          style={{
            width: 250,
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgb(0 0 0 / 0.1)",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <h3>Panel de control</h3>
          <SidebarButton iconClass="fa-solid fa-basket-shopping">Compras</SidebarButton>
          <SidebarButton iconClass="fa-solid fa-envelope">Buzón</SidebarButton>
          <SidebarButton iconClass="fa-regular fa-heart">Favoritos</SidebarButton>
          <SidebarButton iconClass="fa-solid fa-gear">Configuración</SidebarButton>
          <SidebarButton iconClass="fa-solid fa-circle-question">Soporte</SidebarButton>
        </aside>

        {/* Contenido principal a la derecha */}
        <main style={{ flexGrow: 1 }}>
          <h1 className="mb-4">Bienvenido, {first_name}!</h1>
          <p><strong>Email:</strong> {email}</p>
          <p>Este es tu panel de control como comprador.</p>
          {/* Aquí puedes agregar más secciones o funcionalidades específicas para compradores */}
        </main>
      </div>
    );
  }

  if (role === "vendedor") {
    // Panel vacío para vendedor (a completar después)
    return (
      <div className="container mt-5 text-center">
        {/* Aquí irá el dashboard para vendedor */}
      </div>
    );
  }

  return (
    <div className="container text-center mt-5">
      <h3>Rol desconocido</h3>
      <p>Tu rol no tiene acceso a este dashboard.</p>
    </div>
  );
}
