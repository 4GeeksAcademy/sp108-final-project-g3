import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Dashboard() {
  const { store } = useGlobalReducer();
  const user = store.user;
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState("default");

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccessMessage(location.state.successMessage);

      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  if (!user || !user.role) {
    return (
      <div className="container text-center mt-5">
        <h3>Rol desconocido</h3>
        <p>Tu rol no tiene acceso a este dashboard.</p>
      </div>
    );
  }

  const { role, first_name = "", email = "" } = user;

  const SidebarButton = ({ iconClass, children, onClick }) => {
    const [hover, setHover] = React.useState(false);

    return (
      <button
        style={{
          padding: "10px 15px",
          backgroundColor: hover ? "#c6f6d5" : "#e6f4ea",
          border: "1px solid #34a853",
          borderRadius: 5,
          color: "#2f855a",
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
        onClick={onClick}
      >
        <i
          className={iconClass}
          style={{ minWidth: 20, textAlign: "center", color: "#2f855a" }}
        ></i>
        {children}
      </button>
    );
  };

  const renderSuccessMessage = () => {
    if (!successMessage) return null;
    return (
      <div
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          backgroundColor: "#d4edda",
          color: "#155724",
          borderRadius: "5px",
          border: "1px solid #c3e6cb",
          position: "relative",
          fontWeight: "600",
        }}
      >
        {successMessage}
        <button
          onClick={() => setSuccessMessage("")}
          style={{
            position: "absolute",
            top: 5,
            right: 10,
            background: "transparent",
            border: "none",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#155724",
          }}
          aria-label="Cerrar mensaje"
        >
          ×
        </button>
      </div>
    );
  };

  if (role === "comprador") {
    return (
      <div className="container mt-5" style={{ display: "flex", gap: "30px" }}>
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
          <SidebarButton iconClass="fa-solid fa-basket-shopping">
            Compras
          </SidebarButton>
          <SidebarButton iconClass="fa-solid fa-envelope">Buzón</SidebarButton>
          <SidebarButton iconClass="fa-regular fa-heart">Favoritos</SidebarButton>
          <SidebarButton iconClass="fa-solid fa-gear">Configuración</SidebarButton>
          <SidebarButton iconClass="fa-solid fa-circle-question">Soporte</SidebarButton>
        </aside>

        <main style={{ flexGrow: 1 }}>
          {renderSuccessMessage()}
          <h1 className="mb-4">Bienvenido, {first_name}!</h1>
          <p>
            <strong>Email:</strong> {email}
          </p>
          <p>Este es tu panel de control como comprador.</p>
        </main>
      </div>
    );
  }

  if (role === "vendedor") {
    return (
      <div className="container mt-5" style={{ display: "flex", gap: "30px" }}>
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
          <SidebarButton
            iconClass="fa-solid fa-plus"
            onClick={() => {
              setView("default");
              navigate("/publish-product");
            }}
          >
            Publicar producto
          </SidebarButton>

          <SidebarButton
            iconClass="fa-solid fa-box"
            onClick={() => {
              navigate("/my-products");
            }}
          >
            Mis productos
          </SidebarButton>

          <SidebarButton iconClass="fa-regular fa-heart">Favoritos</SidebarButton>
          <SidebarButton iconClass="fa-solid fa-gear">Configuración</SidebarButton>
          <SidebarButton iconClass="fa-solid fa-circle-question">Soporte</SidebarButton>
        </aside>

        <main style={{ flexGrow: 1 }}>
          {renderSuccessMessage()}
          <h1 className="mb-4">Bienvenido, {first_name}!</h1>
          <p>
            <strong>Email:</strong> {email}
          </p>
          {view === "default" && <p>Este es tu panel de control como vendedor.</p>}
        </main>
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
