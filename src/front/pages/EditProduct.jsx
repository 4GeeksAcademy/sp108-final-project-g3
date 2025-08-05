import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const CLOUDINARY_UPLOAD_PRESET = "Treedia";
const CLOUDINARY_CLOUD_NAME = "daqzuortc";
const CLOUDINARY_API = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    tags: "new",
  });
  const [available, setAvailable] = useState(true);
  const [images, setImages] = useState(Array(10).fill(null)); // mezcla de URLs y Files
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const inputFileRefs = useRef([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/${id}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Error al cargar el producto.");

        setFormData({
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          tags: data.tags,
        });
        setAvailable(data.available);
        setImages(
          Array(10)
            .fill(null)
            .map((_, i) => data.image_urls[i] || null)
        );
      } catch (error) {
        setMessage({ type: "error", text: error.message });
      }
    };

    fetchProduct();
  }, [id]);

  const handleImageClick = (index) => {
    inputFileRefs.current[index]?.click();
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const handleRemoveImage = (index) => {
    if (window.confirm("¿Quieres eliminar esta imagen?")) {
      const newImages = [...images];
      newImages[index] = null;
      setImages(newImages);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_API, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Error subiendo la imagen");
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!formData.title || !formData.description || !formData.price || !formData.tags) {
      setMessage({ type: "error", text: "Por favor completa todos los campos obligatorios." });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No autenticado.");

      const finalImageUrls = await Promise.all(
        images.map(async (img) => {
          if (img === null) return null;
          if (typeof img === "string") return img; // ya es URL
          return await uploadImageToCloudinary(img); // subir nuevo
        })
      );

      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          available,
          images: finalImageUrls.filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Error al actualizar el producto." });
      } else {
        setMessage({ type: "success", text: "Producto actualizado correctamente." });
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const imageSlots = images.map((img, index) => {
    let previewUrl = null;
    if (img) {
      previewUrl = typeof img === "string" ? img : URL.createObjectURL(img);
    }

    return (
      <div
        key={index}
        onClick={() => handleImageClick(index)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e2e6ea";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        style={{
          cursor: "pointer",
          border: "2px solid #6c757d",
          borderRadius: 10,
          width: 110,
          height: 110,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          backgroundColor: "transparent",
        }}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={`Imagen ${index + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage(index);
              }}
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                backgroundColor: "transparent",
                border: "none",
                color: "red",
                fontWeight: "bold",
                fontSize: "20px",
                cursor: "pointer",
              }}
              aria-label={`Eliminar imagen ${index + 1}`}
            >
              ×
            </button>
          </>
        ) : (
          <span style={{ color: "#6c757d" }}>+</span>
        )}
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={(el) => (inputFileRefs.current[index] = el)}
          onChange={(e) => handleImageChange(e, index)}
        />
      </div>
    );
  });

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4 text-center">Editar producto</h2>

      {message.text && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">Título *</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej: iPhone 13 Pro"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Descripción *</label>
          <textarea
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Precio (€) *</label>
          <input
            type="number"
            name="price"
            className="form-control"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Ubicación</label>
          <input
            type="text"
            name="location"
            className="form-control"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            Fotos del producto <small>(máx. 10)</small>
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 110px)",
              gap: "10px",
              justifyContent: "start",
            }}
          >
            {imageSlots}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Estado *</label>
          <select
            name="tags"
            className="form-select"
            value={formData.tags}
            onChange={handleChange}
            required
          >
            <option value="new">Nuevo</option>
            <option value="used">Usado</option>
            <option value="acceptable">Aceptable</option>
          </select>
        </div>

        <div className="form-check form-switch mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="availableSwitch"
            checked={available}
            onChange={() => setAvailable(!available)}
          />
          <label className="form-check-label" htmlFor="availableSwitch">
            Disponible para la venta
          </label>
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Actualizando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
