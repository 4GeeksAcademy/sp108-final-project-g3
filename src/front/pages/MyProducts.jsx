import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function MyProducts() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);

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

        if (!response.ok) throw new Error("Error al cargar productos");

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

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: 1000,
        margin: "auto",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>Mis productos publicados</h2>

      {loadingProducts && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <div className="spinner" />
          <p>Cargando productos...</p>
        </div>
      )}

      {errorProducts && (
        <p style={{ color: "red", textAlign: "center", marginBottom: 20 }}>
          Error: {errorProducts}
        </p>
      )}

      {!loadingProducts && !errorProducts && myProducts.length === 0 && (
        <p style={{ textAlign: "center", color: "#555" }}>No tienes productos publicados aún.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {myProducts.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 15,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: "#fff",
              transition: "transform 0.2s",
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
            <div style={{ flexGrow: 1 }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 18,
                  color: "#2f855a",
                }}
              >
                {product.title}
              </h3>
              <p
                style={{
                  fontWeight: "bold",
                  margin: "0 0 10px 0",
                  fontSize: 16,
                }}
              >
                €{product.price.toFixed(2)}
              </p>
              <p
                style={{
                  color: "#555",
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              >
                {product.description.length > 100
                  ? product.description.substring(0, 100) + "..."
                  : product.description}
              </p>
            </div>

            <button
              onClick={() => navigate(`/products/edit/${product.id}`)}
              style={{
                marginTop: 15,
                padding: "8px 12px",
                backgroundColor: "#2f855a",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      <style>
        {`
          .spinner {
            margin: 0 auto 10px auto;
            width: 36px;
            height: 36px;
            border: 4px solid #34a853;
            border-top: 4px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
