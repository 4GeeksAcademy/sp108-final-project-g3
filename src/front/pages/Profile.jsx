import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
  const { user_id } = useParams();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserAndProducts = async () => {
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
        const token = localStorage.getItem("token");
        const productsRes = await fetch(`${API_URL}/api/products/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const productsData = await productsRes.json();
        if (!productsRes.ok) {
          throw new Error(productsData.message || "Error al cargar los productos");
        }
        // Filtrar productos para mostrar solo los del usuario actual (si es el propio perfil)
        setProducts(productsData.results.filter((product) => product.user_id === parseInt(user_id)));
      } catch (err) {
        setError(err.message || "Error de conexión. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProducts();
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

  return (
    <div className="container mt-5">
      <h2>Perfil de {user.first_name} {user.last_name}</h2>
      <div className="row">
        {/* Información del usuario */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="card-title">Información del usuario</h4>
              <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Rol:</strong> {user.role === "vendedor" ? "Vendedor" : "Comprador"}</p>
            </div>
          </div>
        </div>

        {/* Productos del usuario */}
        <div className="col-md-8">
          <h4>Productos publicados</h4>
          {products.length === 0 ? (
            <p>Este usuario no ha publicado productos.</p>
          ) : (
            <div className="row">
              {products.map((product) => (
                <div className="col-md-6 mb-3" key={product.id}>
                  <Link to={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                    <div
                      className="card h-100"
                      style={{
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      <img
                        src={
                          product.image_urls && product.image_urls.length > 0
                            ? product.image_urls[0]
                            : "https://via.placeholder.com/150"
                        }
                        className="card-img-top"
                        alt={product.title}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{product.title}</h5>
                        <p className="card-text">{product.price} €</p>
                        <p className="card-text text-muted">{product.category}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;