import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("No se pudo cargar el producto");

        const data = await response.json();
        setProduct(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [API_URL, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) throw new Error("No se pudo actualizar el producto");

      navigate("/my-products");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Cargando producto...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!product) return null;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>Editar producto</h2>
      <form onSubmit={handleSubmit}>
        <label>Título:</label>
        <input
          name="title"
          value={product.title}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Descripción:</label>
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          rows="4"
          style={inputStyle}
        />

        <label>Precio (€):</label>
        <input
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Ubicación:</label>
        <input
          name="location"
          value={product.location || ""}
          onChange={handleChange}
          style={inputStyle}
        />

        <button type="submit" disabled={saving} style={buttonStyle}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#34a853",
  color: "#fff",
  fontWeight: "bold",
  fontSize: "16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
