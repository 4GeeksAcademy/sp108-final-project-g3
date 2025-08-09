import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
    category: "",
  });
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [images, setImages] = useState(Array(10).fill(null));
  const inputFileRefs = useRef([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage({ type: "error", text: "Debes iniciar sesión." });
          return;
        }

        const res = await fetch(`${API_URL}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          setMessage({ type: "error", text: data.message || "Error cargando el producto." });
          return;
        }

        // Rellenar formulario con datos recibidos
        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          location: data.location || "",
          tags: data.tags || "new",
          category: data.category || "",
        });

        setAvailable(data.available ?? true);

        const imgs = Array(10).fill(null);
        if (Array.isArray(data.images)) {
          data.images.slice(0, 10).forEach((url, i) => {
            imgs[i] = url;
          });
        }
        setImages(imgs);
      } catch (error) {
        setMessage({ type: "error", text: error.message || "Error de conexión." });
      }
    }
    fetchProduct();
  }, [id]);

  const handleImageClick = (index) => {
    inputFileRefs.current[index].click();
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
    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_API, {
      method: "POST",
      body: formDataCloud,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Error subiendo la imagen");
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!formData.title || !formData.description || !formData.price || !formData.tags || !formData.category) {
      setMessage({ type: "error", text: "Por favor completa todos los campos obligatorios." });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Debes iniciar sesión para editar un producto." });
        setLoading(false);
        return;
      }

      const uploadPromises = images.map(async (img) => {
        if (img && typeof img !== "string") {
          return await uploadImageToCloudinary(img);
        } else if (typeof img === "string") {
          return img;
        }
        return null;
      });

      const imageUrls = (await Promise.all(uploadPromises)).filter(Boolean);

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
          images: imageUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Error al actualizar el producto." });
      } else {
        setMessage({ type: "success", text: "Producto actualizado correctamente." });

        setTimeout(() => {
          navigate("/my-products", { state: { successMessage: "Producto actualizado correctamente." } });
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Error de conexión. Inténtalo más tarde." });
    } finally {
      setLoading(false);
    }
  };

  const imageSlots = images.map((file, index) => {
    let previewUrl = null;
    if (file) {
      if (typeof file === "string") {
        previewUrl = file;
      } else {
        previewUrl = URL.createObjectURL(file);
      }
    }

    return (
      <div
        key={index}
        onClick={() => handleImageClick(index)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#c6f6d5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        style={{
          cursor: "pointer",
          border: "2px solid #2f855a",
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
                zIndex: 10,
              }}
              aria-label={`Eliminar imagen ${index + 1}`}
            >
              ×
            </button>
          </>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="#5c7a89"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fillRule="evenodd"
              d="M11.625 3a2.625 2.625 0 1 0 0 5.25 2.625 2.625 0 0 0 0-5.25M10.5 5.625a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M.75 5.25a4.5 4.5 0 0 1 4.5-4.5H16.5a4.5 4.5 0 0 1 4.307 3.193A4.5 4.5 0 0 1 24 8.25V19.5a4.5 4.5 0 0 1-4.5 4.5H8.25a4.5 4.5 0 0 1-4.307-3.193A4.5 4.5 0 0 1 .75 16.5zM2.25 15v-2.734l3.543-4.36a.75.75 0 0 1 1.164 0l3.186 3.922a1.5 1.5 0 0 0 2.225.114l2.321-2.32a1.5 1.5 0 0 1 2.122 0L19.5 12.31V15zm15.621-6.44 1.629 1.63V5.25a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3v4.638L4.629 6.96a2.25 2.25 0 0 1 3.492 0l3.187 3.922 2.32-2.321a3 3 0 0 1 4.243 0M21 16.5a4.5 4.5 0 0 1-4.5 4.5H5.65a3 3 0 0 0 2.599 1.5H19.5a3 3 0 0 0 3-3V8.25A3 3 0 0 0 21 5.651zm-18.75 0a3 3 0 0 0 3 3H16.5a3 3 0 0 0 3-3z"
              clipRule="evenodd"
            />
          </svg>
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
          <label className="form-label" style={{ fontWeight: "bold" }}>
            Título *
          </label>
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
          <label className="form-label" style={{ fontWeight: "bold" }}>
            Descripción *
          </label>
          <textarea
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe el producto en detalle..."
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ fontWeight: "bold" }}>
            Precio (€) *
          </label>
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
          <label className="form-label" style={{ fontWeight: "bold" }}>
            Ubicación
          </label>
          <input
            type="text"
            name="location"
            className="form-control"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ej: Madrid, España"
          />
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ fontWeight: "bold" }}>
            Categoría *
          </label>
          <select
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una categoría</option>
            <option value="Coches">Coches</option>
            <option value="Motos">Motos</option>
            <option value="Motor y Accesorios">Motor y Accesorios</option>
            <option value="Moda y Accesorios">Moda y Accesorios</option>
            <option value="Tecnología y Electrónica">Tecnología y Electrónica</option>
            <option value="Móviles y Tecnología">Móviles y Tecnología</option>
            <option value="Informática">Informática</option>
            <option value="Deporte y Ocio">Deporte y Ocio</option>
            <option value="Bicicletas">Bicicletas</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ fontWeight: "bold" }}>
            Estado *
          </label>
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

        <div className="mb-3">
          <label className="form-label" style={{ fontWeight: "bold" }}>
            Fotos del producto <small>(Puedes subir hasta un máximo de 10 imágenes)</small>
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

        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? "Guardando cambios..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
