import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
  const { user_id } = useParams();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError("");
      try {
        const userRes = await fetch(`${API_URL}/api/users/${user_id}`);
        const userData = await userRes.json();
        if (!userRes.ok) {
          throw new Error(userData.message || "Error al cargar el usuario");
        }
        setUser(userData.results);

        const productsRes = await fetch(`${API_URL}/api/products/user/${user_id}`);
        const productsData = await productsRes.json();
        if (!productsRes.ok) {
          throw new Error(productsData.message || "Error al cargar los productos");
        }
        setProducts(productsData.results || []);

        const token = localStorage.getItem("token");
        const currentUserId = localStorage.getItem("user_id");
        if (token && currentUserId === user_id) {
          const favoritesRes = await fetch(`${API_URL}/api/favorites`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const favoritesData = await favoritesRes.json();
          if (favoritesRes.ok) {
            setFavorites(favoritesData.results || []);
          }
        }

        const commentsRes = await fetch(`${API_URL}/api/comments/profile/${user_id}`);
        const commentsData = await commentsRes.json();
        if (commentsRes.ok) {
          setComments(commentsData.results || []);
        }
      } catch (err) {
        setError(err.message || "Error de conexión. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user_id]);

  if (loading) {
    return <div className="container mt-5 text-center">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  if (!user) {
    return <div className="container mt-5">Usuario no encontrado.</div>;
  }

  const isCurrentUser = localStorage.getItem("user_id") === user_id;
  const token = localStorage.getItem("token");

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile_user_id: parseInt(user_id),
          content: newComment.trim()
        })
      });

      const data = await response.json();
      if (response.ok) {
        setComments([data.results, ...comments]);
        setNewComment("");
      } else {
        alert(data.message || "Error al crear el comentario");
      }
    } catch (error) {
      alert("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return;

    if (confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      try {
        const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setComments(comments.filter(comment => comment.id !== commentId));
        } else {
          const data = await response.json();
          alert(data.message || "Error al eliminar el comentario");
        }
      } catch (error) {
        alert("Error de conexión. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-body text-center">
              <div className="d-flex justify-content-center mb-3">
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                    color: "#6c757d"
                  }}
                >
                  {user.first_name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2>{user.first_name} {user.last_name}</h2>
              <p className="text-muted mb-1">{user.email}</p>
              <p className="text-muted">
                {user.role === "vendedor" ? "Vendedor" : "Comprador"} |
                {user.location && ` Ubicación: ${user.location}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Productos publicados
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            Comentarios ({comments.length})
          </button>
        </li>
        {isCurrentUser && (
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "favorites" ? "active" : ""}`}
              onClick={() => setActiveTab("favorites")}
            >
              Mis favoritos
            </button>
          </li>
        )}
      </ul>

      <div className="tab-content">
        {activeTab === "products" && (
          <div className="tab-pane fade show active">
            {products.length === 0 ? (
              <div className="alert alert-info">
                {isCurrentUser ? "No has publicado ningún producto aún." : "Este usuario no ha publicado productos."}
              </div>
            ) : (
              <div className="row">
                {products.map((product) => (
                  <div className="col-md-4 mb-4" key={product.id}>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                      <div className="card h-100 product-card">
                        <img
                          src={
                            product.image_urls && product.image_urls.length > 0
                              ? product.image_urls[0]
                              : "https://via.placeholder.com/300x200?text=Sin+imagen"
                          }
                          className="card-img-top"
                          alt={product.title}
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                        <div className="card-body">
                          <h5 className="card-title">{product.title}</h5>
                          <p className="card-text text-success fw-bold">{product.price} €</p>
                          <p className="card-text">
                            <span className={`badge ${product.tags === "new" ? "bg-primary" :
                              product.tags === "used" ? "bg-secondary" : "bg-warning"
                              }`}>
                              {product.tags === "new" ? "Nuevo" : product.tags === "used" ? "Usado" : "Aceptable"}
                            </span>
                          </p>
                          <p className="card-text text-muted">{product.category}</p>
                          {!product.available && (
                            <p className="text-danger">No disponible</p>
                          )}
                          {product.was_sold && (
                            <p className="text-danger">Vendido</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className="tab-pane fade show active">
            {!isCurrentUser && token && (
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Dejar un comentario</h5>
                  <form onSubmit={handleSubmitComment}>
                    <div className="mb-3">
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Escribe tu comentario aquí..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submittingComment}
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submittingComment || !newComment.trim()}
                    >
                      {submittingComment ? "Enviando..." : "Enviar comentario"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {comments.length === 0 ? (
              <div className="alert alert-info">
                {isCurrentUser ? "No tienes comentarios en tu perfil." : "Este usuario no tiene comentarios en su perfil."}
              </div>
            ) : (
              <div className="row">
                {comments.map((comment) => (
                  <div className="col-12 mb-3" key={comment.id}>
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-subtitle mb-1 text-primary">
                            {comment.user_name}
                          </h6>
                          <small className="text-muted">
                            {new Date(comment.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                        <p className="card-text">{comment.content}</p>
                        {(comment.user_id === parseInt(localStorage.getItem("user_id")) || isCurrentUser) && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="tab-pane fade show active">
            {favorites.length === 0 ? (
              <div className="alert alert-info">No tienes productos favoritos.</div>
            ) : (
              <div className="row">
                {favorites.map((favorite) => (
                  <div className="col-md-4 mb-4" key={favorite.favorite_id}>
                    <Link to={`/product/${favorite.product.id}`} style={{ textDecoration: "none" }}>
                      <div className="card h-100 product-card">
                        <img
                          src={
                            favorite.product.image_urls && favorite.product.image_urls.length > 0
                              ? favorite.product.image_urls[0]
                              : "https://via.placeholder.com/300x200?text=Sin+imagen"
                          }
                          className="card-img-top"
                          alt={favorite.product.title}
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                        <div className="card-body">
                          <h5 className="card-title">{favorite.product.title}</h5>
                          <p className="card-text text-success fw-bold">{favorite.product.price} €</p>
                          <p className="card-text">
                            <span className={`badge ${favorite.product.tags === "new" ? "bg-primary" :
                              favorite.product.tags === "used" ? "bg-secondary" : "bg-warning"
                              }`}>
                              {favorite.product.tags === "new" ? "Nuevo" : favorite.product.tags === "used" ? "Usado" : "Aceptable"}
                            </span>
                          </p>
                          <p className="card-text text-muted">{favorite.product.category}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;