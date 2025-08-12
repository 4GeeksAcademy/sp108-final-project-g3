import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [favoritesError, setFavoritesError] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    const fetchProductAndUser = async () => {
      setLoading(true);
      setError("");
      setFavoritesError(false);
      try {
        const productRes = await fetch(`${API_URL}/api/products/${id}`);
        const productData = await productRes.json();
        if (!productRes.ok) {
          throw new Error(productData.message || "Error al cargar el producto");
        }
        setProduct(productData);

        const userRes = await fetch(`${API_URL}/api/users/${productData.user_id}`);
        const userData = await userRes.json();
        if (!userRes.ok) {
          throw new Error(userData.message || "Error al cargar el usuario");
        }
        setUser(userData.results);

        const token = localStorage.getItem("token");
        if (token) {
          try {
            const favoritesRes = await fetch(`${API_URL}/api/favorites`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const favoritesData = await favoritesRes.json();
            if (!favoritesRes.ok) {
              console.error("Error en GET /api/favorites:", favoritesRes.status, favoritesData);
              throw new Error(favoritesData.message || `Error ${favoritesRes.status} al cargar favoritos`);
            }
            if (favoritesData.results && Array.isArray(favoritesData.results)) {
              const favorite = favoritesData.results.find((fav) => fav.product_id === parseInt(id));
              if (favorite) {
                setIsFavorite(true);
                setFavoriteId(favorite.id);
              }
            } else {
              console.error("Formato inesperado en la respuesta de /api/favorites:", favoritesData);
              setFavoritesError(true);
            }
          } catch (favErr) {
            console.error("Error al obtener favoritos:", favErr.message);
            setFavoritesError(true);
          }
        }
      } catch (err) {
        setError(err.message || "Error de conexión. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndUser();
  }, [id]);

  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Debes iniciar sesión para añadir a favoritos.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (favoritesError) {
      setMessage("No se puede gestionar favoritos debido a un error en la carga.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      if (isFavorite) {
        const res = await fetch(`${API_URL}/api/favorites/${favoriteId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Error al quitar de favoritos");
        }
        setIsFavorite(false);
        setFavoriteId(null);
        setMessage("Producto eliminado de favoritos.");
      } else {
        const res = await fetch(`${API_URL}/api/favorites`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_id: parseInt(id) }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Error al añadir a favoritos");
        }
        setIsFavorite(true);
        setFavoriteId(data.results.id);
        setMessage("Producto añadido a favoritos.");
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message || "Error al procesar la solicitud.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Debes iniciar sesión para enviar un mensaje.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!messageContent.trim()) {
      setMessage("El mensaje no puede estar vacío.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setMessageSending(true);
    try {
      const currentDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_sender: localStorage.getItem("user_id"), // Asumimos que user_id está en el token o localStorage
          user_receiver: product.user_id,
          content: messageContent,
          created_at: currentDateTime,
          review_date: currentDateTime,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al enviar el mensaje");
      }
      setMessage("Mensaje enviado correctamente.");
      setMessageContent("");
      setShowMessageModal(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message || "Error al enviar el mensaje.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setMessageSending(false);
    }
  };

  if (loading) {
    return <div className="container mt-5 text-center">Cargando producto...</div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  if (!product) {
    return <div className="container mt-5">Producto no encontrado.</div>;
  }

  return (
    <div className="container mt-5">
      {message && (
        <div
          className={`alert ${message.includes("enviado correctamente") || isFavorite && !message.includes("Error") ? "alert-success" : "alert-info"} alert-dismissible fade show`}
          role="alert"
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          {message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
            aria-label="Close"
          ></button>
        </div>
      )}

     <h2 className="mb-3" style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
        {product.title}
      </h2>

      <div className="row">
        <div className="col-md-6 mb-4">
          {product.image_urls && product.image_urls.length > 0 ? (
            <div
              id="productCarousel"
              className="carousel slide shadow-sm"
              data-bs-ride="carousel"
              style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
            >
              <div className="carousel-inner">
                {product.image_urls.map((url, index) => (
                  <div className={`carousel-item ${index === 0 ? "active" : ""}`} key={index}>
                    <img
                      src={url}
                      className="d-block w-100"
                      alt={`${product.title} - Imagen ${index + 1}`}
                      style={{ height: "400px", objectFit: "contain", borderRadius: "8px" }}
                    />
                  </div>
                ))}
              </div>
              {product.image_urls.length > 1 && (
                <>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#productCarousel"
                    data-bs-slide="prev"
                  >
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#productCarousel"
                    data-bs-slide="next"
                  >
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <img
              src="https://via.placeholder.com/400?text=Sin+imagen"
              className="img-fluid"
              alt="Sin imagen"
              style={{ height: "400px", objectFit: "contain", borderRadius: "8px", backgroundColor: "#f8f9fa" }}
            />
          )}
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-3" style={{ borderRadius: "8px" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="card-title mb-0" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {product.price} €
                </h3>
                <button
                  className="btn p-0"
                  onClick={handleFavoriteToggle}
                  disabled={product.was_sold || !product.available || favoritesError}
                  title={
                    product.was_sold
                      ? "No se puede añadir a favoritos: producto vendido"
                      : !product.available
                      ? "No se puede añadir a favoritos: producto no disponible"
                      : favoritesError
                      ? "No se puede gestionar favoritos: error en la carga"
                      : isFavorite
                      ? "Quitar de favoritos"
                      : "Añadir a favoritos"
                  }
                >
                  <i
                    className={`${isFavorite ? "fas" : "far"} fa-heart fa-lg`}
                    style={{ color: isFavorite ? "#dc3545" : "#6c757d" }}
                  ></i>
                </button>
              </div>
              <p className="text-muted mb-2">
                <strong>Estado:</strong>{" "}
                {product.tags === "new" ? "Nuevo" : product.tags === "used" ? "Usado" : "Aceptable"}
              </p>
              <p className="text-muted mb-2">
                <strong>Categoría:</strong> {product.category}
              </p>
              <p className="text-muted mb-2">
                <strong>Ubicación:</strong> {product.location || "No especificada"}
              </p>
              <p className="text-muted mb-2">
                <strong>Disponible:</strong> {product.available ? "Sí" : "No"}
              </p>
              {product.was_sold && (
                <p className="text-danger mb-2"><strong>Estado:</strong> Vendido</p>
              )}
              <hr />
              <h5 className="mb-2">Descripción</h5>
              <p className="mb-3">{product.description}</p>
              <hr />
              <h5 className="mb-2">Vendedor</h5>
              <p className="mb-3">
                {user ? (
                  <Link
                    to={`/profile/${user.id}`}
                    style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}
                  >
                    {user.first_name} {user.last_name}
                  </Link>
                ) : (
                  "Cargando vendedor..."
                )}
              </p>
              <button
                className="btn btn-success w-100"
                onClick={() => setShowMessageModal(true)}
                disabled={product.was_sold || !product.available}
                title={
                  product.was_sold
                    ? "No se puede contactar: producto vendido"
                    : !product.available
                    ? "No se puede contactar: producto no disponible"
                    : "Contactar al vendedor"
                }
              >
                <i className="fas fa-envelope me-2"></i> Contactar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para enviar mensaje */}
      {showMessageModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enviar mensaje al vendedor</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowMessageModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="messageContent" className="form-label">
                    Mensaje
                  </label>
                  <textarea
                    className="form-control"
                    id="messageContent"
                    rows="4"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMessageModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={messageSending}
                >
                  {messageSending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;