import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function MyProducts() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);
  const [activeTab, setActiveTab] = useState("en-venta");
  const [message, setMessage] = useState(location.state?.successMessage || null);

  useEffect(() => {
    if (message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  useEffect(() => {
    const loadMyProducts = async () => {
      setLoadingProducts(true);
      setErrorProducts(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No hay token JWT");

        const response = await fetch(`${API_URL}/api/products/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 404) {
          setMyProducts([]);
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error("Error al cargar productos: " + errorText);
        }

        const data = await response.json();
        setMyProducts(data.results);
      } catch (error) {
        setErrorProducts(error.message);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadMyProducts();
  }, [API_URL]);

  const filteredProducts = myProducts.filter((product) => {
    if (activeTab === "en-venta") return product.available && !product.was_sold;
    if (activeTab === "vendidos") return product.was_sold;
    if (activeTab === "desactivados") return !product.available && !product.was_sold;
    return true;
  });

  return (
    <div style={{ padding: "20px", maxWidth: 1000, margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>Mis productos</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        {["en-venta", "vendidos", "desactivados"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              border: "1px solid #ccc",
              backgroundColor: activeTab === tab ? "#2f855a" : "#f9f9f9",
              color: activeTab === tab ? "#fff" : "#000",
              cursor: "pointer",
              marginRight: 5,
              borderRadius: "5px 5px 0 0",
              fontWeight: activeTab === tab ? "bold" : "normal",
            }}
          >
            {tab === "en-venta" && "En Venta"}
            {tab === "vendidos" && "Vendidos"}
            {tab === "desactivados" && "Desactivados"}
          </button>
        ))}
      </div>

      {message && (
        <div
          style={{
            marginBottom: 20,
            padding: "10px",
            backgroundColor: "#d1e7dd",
            color: "#0f5132",
            border: "1px solid #badbcc",
            borderRadius: 5,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {message}
          <button
            onClick={() => setMessage(null)}
            style={{
              marginLeft: 10,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "#0f5132",
            }}
          >
            ×
          </button>
        </div>
      )}

      {loadingProducts && <p style={{ textAlign: "center" }}>Cargando productos...</p>}
      {errorProducts && (
        <p style={{ color: "red", textAlign: "center" }}>Error: {errorProducts}</p>
      )}
      {!loadingProducts && !errorProducts && filteredProducts.length === 0 && (
        <p style={{ textAlign: "center", color: "#555" }}>No hay productos en esta categoría.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 15,
              backgroundColor: "#fff",
            }}
          >
            {product.image_urls?.length > 0 && (
              <img
                src={product.image_urls[0]}
                alt={product.title}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 6,
                  marginBottom: 12,
                }}
              />
            )}
            <h3 style={{ fontSize: 18, color: "#2f855a", marginBottom: 5 }}>
              {product.title}
            </h3>
            <p style={{ fontWeight: "bold", marginBottom: 10 }}>
              €{product.price.toFixed(2)}
            </p>
            <p style={{ color: "#555", fontSize: 14 }}>
              {product.description.length > 100
                ? product.description.substring(0, 100) + "..."
                : product.description}
            </p>
            <button
              onClick={() => navigate(`/edit-product/${product.id}`)}
              style={{
                marginTop: 15,
                padding: "8px 12px",
                backgroundColor: "#2f855a",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
