import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'tu_clave_publica_de_stripe');

const CheckoutForm = ({ productId, price, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ product_id: productId })
      });

      const { clientSecret } = await response.json();

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      console.error('Error al procesar el pago:', err);
      setError('Ocurrió un error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="border rounded-lg p-4">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={!stripe || loading}
        >
          {loading ? 'Procesando...' : `Pagar €${(price / 100).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const checkFavorite = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/favorites/check/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.is_favorite);
        if (data.is_favorite) setFavoriteId(data.favorite_id);
      }
      return data;
    } catch (err) {
      console.error("Error checking favorite:", err);
      return { is_favorite: false };
    }
  };

  useEffect(() => {
    const fetchProductAndUser = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch product data
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
          await checkFavorite(token);
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

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch(`${API_URL}/api/favorites/${favoriteId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Error al quitar de favoritos");
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
        if (!res.ok) throw new Error(data.message || "Error al añadir a favoritos");
        
        if (data.already_exists) {
          setIsFavorite(true);
          setFavoriteId(data.favorite_id);
          setMessage("Este producto ya estaba en tus favoritos.");
        } else {
          setIsFavorite(true);
          setFavoriteId(data.favorite_id);
          setMessage("Producto añadido a favoritos.");
        }
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message || "Error al procesar la solicitud.");
      setTimeout(() => setMessage(""), 3000);
      console.error("Error en favoritos:", err);
    } finally {
      setFavoriteLoading(false);
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
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error("Token inválido");
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const userSender = payload.user_id;
      
      if (!userSender) {
        throw new Error("No se pudo identificar tu usuario. Vuelve a iniciar sesión.");
      }

      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');

      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_sender: userSender,
          user_receiver: product.user_id,
          content: messageContent,
          created_at: formattedDate
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error al enviar el mensaje");
      }

      setMessage("Mensaje enviado correctamente.");
      setMessageContent("");
      setShowMessageModal(false);
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setMessage(err.message || "Error al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setMessageSending(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setPaymentSuccess(true);
    setShowPaymentModal(false);
    setMessage('¡Pago realizado con éxito! Gracias por tu compra.');
    setTimeout(() => setMessage(''), 5000);
    
    try {
      await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ is_sold: true })
      });
      
      setProduct({ ...product, is_sold: true });
    } catch (err) {
      console.error('Error al actualizar el estado del producto:', err);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
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
          className={`alert ${message.includes("enviado correctamente") || message.includes("añadido") || message.includes("éxito") ? "alert-success" : "alert-info"} alert-dismissible fade show`}
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

      <div className="d-flex justify-content-center mb-3">
        <nav aria-label="breadcrumb" style={{ width: "100%", maxWidth: "1200px" }}>
          <ol className="breadcrumb justify-content-center">
            <li className="breadcrumb-item">
              <Link to="/" style={{ textDecoration: "none", color: "#007bff" }}>
                Inicio
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link 
                to={`/category/${product.category.toLowerCase()}`} 
                style={{ textDecoration: "none", color: "#007bff" }}
              >
                {product.category}
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.title}
            </li>
          </ol>
        </nav>
      </div>

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

          <div className="card shadow-sm mt-4 p-3" style={{ borderRadius: "8px" }}>
            <div className="card-body">
              <h5 className="mb-3">Descripción</h5>
              <p style={{ whiteSpace: "pre-line" }}>{product.description}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-3" style={{ borderRadius: "8px" }}>
            <div className="card-body">
              <h3 className="card-title mb-2" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {product.title}
              </h3>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0" style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                  {product.price} €
                </h4>
                <button
                  className="btn p-0"
                  onClick={handleFavoriteToggle}
                  disabled={product.was_sold || !product.available || favoriteLoading}
                  title={
                    product.was_sold
                      ? "No se puede añadir a favoritos: producto vendido"
                      : !product.available
                      ? "No se puede añadir a favoritos: producto no disponible"
                      : isFavorite
                      ? "Quitar de favoritos"
                      : "Añadir a favoritos"
                  }
                >
                  <i
                    className={`${isFavorite ? "fas" : "far"} fa-heart fa-lg`}
                    style={{ color: isFavorite ? "#dc3545" : "#6c757d" }}
                  ></i>
                  {favoriteLoading && (
                    <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                  )}
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
                className="btn btn-success w-100 mb-2"
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
              
              {/* Botón de pago */}
              <button
                className="btn btn-primary w-100"
                onClick={() => setShowPaymentModal(true)}
                disabled={product.was_sold || !product.available}
                title={
                  product.was_sold
                    ? "No se puede comprar: producto vendido"
                    : !product.available
                    ? "No se puede comprar: producto no disponible"
                    : `Comprar por €${product.price}`
                }
              >
                <i className="fas fa-credit-card me-2"></i> Comprar ahora
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Completar compra</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">Estás a punto de comprar: <strong>{product.title}</strong></p>
                <p className="h4 mb-4">Total: <span className="text-primary">€{product.price}</span></p>
                
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    productId={product.id}
                    price={product.price * 100}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                  />
                </Elements>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showMessageModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enviar mensaje a {user?.first_name || 'el vendedor'}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageContent("");
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="messageContent" className="form-label">
                    Sobre: {product.title}
                  </label>
                  <textarea
                    className="form-control"
                    id="messageContent"
                    rows="5"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder={`Hola ${user?.first_name || ''}, estoy interesado en tu producto...`}
                    disabled={messageSending}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageContent("");
                  }}
                  disabled={messageSending}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={messageSending || !messageContent.trim()}
                >
                  {messageSending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enviando...
                    </>
                  ) : (
                    "Enviar mensaje"
                  )}
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