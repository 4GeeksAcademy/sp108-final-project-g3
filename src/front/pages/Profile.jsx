import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
  const { user_id } = useParams();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError("");
      try {
        // Obtener detalles del usuario
        const userRes = await fetch(`${API_URL}/api/users/${user_id}`);
        const userData = await userRes.json();
        if (!userRes.ok) {
          throw new Error(userData.message || "Error al cargar el usuario");
        }
        setUser(userData.results);

        // Obtener productos del usuario
        const productsRes = await fetch(`${API_URL}/api/products/user/${user_id}`);
        const productsData = await productsRes.json();
        if (!productsRes.ok) {
          throw new Error(productsData.message || "Error al cargar los productos");
        }
        setProducts(productsData.results || []);

        // Si es el perfil del usuario actual, cargar favoritos
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

      {/* Pestañas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Productos publicados
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

      {/* Contenido de las pestañas */}
      <div className="tab-content">
        {activeTab === "products" ? (
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
                            <span className={`badge ${
                              product.tags === "new" ? "bg-primary" : 
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
        ) : (
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
                            <span className={`badge ${
                              favorite.product.tags === "new" ? "bg-primary" : 
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