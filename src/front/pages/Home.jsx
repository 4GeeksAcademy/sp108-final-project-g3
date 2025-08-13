import { useEffect, useRef, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link } from "react-router-dom";

export const Home = () => {
  const { dispatch } = useGlobalReducer();
  const scrollRef = useRef(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const [latestProducts, setLatestProducts] = useState([]);
  const [favoriteStatus, setFavoriteStatus] = useState({});
  const [loadingFavorites, setLoadingFavorites] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  };

  const loadMessage = async () => {
    try {
      if (!API_URL) throw new Error("VITE_BACKEND_URL no definido");
      const response = await fetch(`${API_URL}/api/hello`);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "set_hello", payload: data.message });
      }
    } catch (error) {
      console.error("Error fetching hello:", error.message);
    }
  };

  const checkFavoriteStatus = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return { is_favorite: false };
    
    try {
      const response = await fetch(`${API_URL}/api/favorites/check/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      return { is_favorite: false };
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return { is_favorite: false };
    }
  };

  const fetchLatestProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products?limit=10&sort=desc`);
      const data = await res.json();

      let products = [];
      if (Array.isArray(data)) {
        products = data;
      } else if (data.results) {
        products = data.results;
      } else {
        products = data.products || [];
      }

      setLatestProducts(products);

      const token = localStorage.getItem('token');
      if (token) {
        const statusPromises = products.map(product => 
          checkFavoriteStatus(product.id)
        );
        const statusResults = await Promise.all(statusPromises);
        
        const newFavoriteStatus = {};
        statusResults.forEach((result, index) => {
          newFavoriteStatus[products[index].id] = {
            isFavorite: result.is_favorite,
            favoriteId: result.favorite_id
          };
        });
        setFavoriteStatus(newFavoriteStatus);
      }
    } catch (error) {
      console.error("Error al cargar últimos productos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage("Debes iniciar sesión para añadir a favoritos");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const role = getUserRole();
    if (role === 'vendedor') {
      setMessage("Los vendedores no pueden añadir productos a favoritos");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoadingFavorites(prev => ({...prev, [productId]: true}));
    
    try {
      const currentStatus = favoriteStatus[productId] || {isFavorite: false};
      
      if (currentStatus.isFavorite) {
        const confirmed = window.confirm(
          "¿Está seguro que desea eliminar este producto de favoritos?"
        );
        if (!confirmed) return;

        const res = await fetch(`${API_URL}/api/favorites/${currentStatus.favoriteId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          setFavoriteStatus(prev => ({
            ...prev,
            [productId]: {isFavorite: false, favoriteId: null}
          }));
          setMessage("Producto eliminado de favoritos");
        }
      } else {
        const res = await fetch(`${API_URL}/api/favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ product_id: productId })
        });
        const data = await res.json();

        if (res.ok) {
          setFavoriteStatus(prev => ({
            ...prev,
            [productId]: {
              isFavorite: true,
              favoriteId: data.favorite_id || data.id
            }
          }));
          setMessage(data.already_exists ? 
            "Este producto ya estaba en tus favoritos" : 
            "Producto añadido a favoritos");
        }
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
      setMessage("Error al procesar la solicitud");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoadingFavorites(prev => ({...prev, [productId]: false}));
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadMessage();
      await fetchLatestProducts();
      const role = getUserRole();
      setUserRole(role);
    };
    init();
  }, []);

  return (
    <>
      {message && (
        <div className={`alert ${message.includes("eliminado") || message.includes("añadido") ? "alert-success" : "alert-warning"} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 z-3`}
          style={{ minWidth: "300px" }}
          role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
        </div>
      )}

      <div
        id="carouselExampleSlidesOnly"
        className="carousel slide"
        data-bs-ride="carousel"
        data-bs-interval="3000"
      >
        <div className="carousel-inner">
          <div className="carousel-item active position-relative">
            <div
              style={{
                height: "300px",
                backgroundColor: "#c96445ff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                className="position-relative z-2 text-white d-flex align-items-center"
                style={{ width: "50%", height: "100%", paddingLeft: "2rem" }}
              >
                <div>
                  <h5>Moda deportiva</h5>
                  <p>Para estar estupendo en cada ocasión</p>
                  <button className="btn btn-primary" type="submit">
                    Comprar
                  </button>
                </div>
              </div>
              <img
                src="https://img.freepik.com/foto-gratis/mujeres-tiro-medio-colchonetas-yoga_23-2149161281.jpg"
                alt="Sport"
                className="position-absolute top-0 end-0 h-100"
                style={{ width: "900px", objectFit: "cover", zIndex: 1 }}
              />
            </div>
          </div>

          <div className="carousel-item position-relative">
            <div
              style={{
                height: "300px",
                backgroundColor: "#c96445ff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                className="position-relative z-2 text-white d-flex align-items-center"
                style={{ width: "50%", height: "100%", paddingLeft: "2rem" }}
              >
                <div>
                  <h5>Vida al aire libre</h5>
                  <p>Conéctate con la naturaleza</p>
                  <button className="btn btn-primary" type="submit">
                    Vender
                  </button>
                </div>
              </div>
              <img
                src="https://www.salvaje.com.uy/wp-content/uploads/2018/06/Untitledddd-1.jpg"
                alt="Nature"
                className="position-absolute top-0 end-0 h-100"
                style={{ width: "900px", objectFit: "cover", zIndex: 1 }}
              />
            </div>
          </div>

          <div className="carousel-item position-relative">
            <div
              style={{
                height: "300px",
                backgroundColor: "#c96445ff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                className="position-relative z-2 text-white d-flex align-items-center"
                style={{ width: "50%", height: "100%", paddingLeft: "2rem" }}
              >
                <div>
                  <h5>Momentos especiales</h5>
                  <p>Comparte lo que amás</p>
                  <button className="btn btn-primary" type="submit">
                    Saber más
                  </button>
                </div>
              </div>
              <img
                src="https://www.shutterstock.com/image-photo/charming-funny-mixed-race-couple-260nw-1746243686.jpg"
                alt="Love"
                className="position-absolute top-0 end-0 h-100"
                style={{ width: "900px", objectFit: "cover", zIndex: 1 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center mb-4">
          <div className="col-lg-8 text-center">
            <h2 className="fw-bold mb-3">Últimos productos</h2>
            <p className="text-muted">
              Las mejores ofertas recién llegadas esperando por ti
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando productos...</p>
          </div>
        ) : (
          <div className="position-relative">
            <button
              className="btn btn-light position-absolute start-0 top-50 translate-middle-y z-3 d-none d-md-block"
              style={{ borderRadius: "50%", transform: "translateX(-20px)" }}
              onClick={() => scroll("left")}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className="btn btn-light position-absolute end-0 top-50 translate-middle-y z-3 d-none d-md-block"
              style={{ borderRadius: "50%", transform: "translateX(20px)" }}
              onClick={() => scroll("right")}
            >
              <i className="fas fa-chevron-right"></i>
            </button>

            <div
              ref={scrollRef}
              className="d-flex flex-nowrap overflow-auto pb-4 gap-3"
              style={{ scrollBehavior: "smooth" }}
            >
              {latestProducts.map((product) => {
                const isFavorite = favoriteStatus[product.id]?.isFavorite || false;
                const isLoading = loadingFavorites[product.id] || false;

                return (
                  <div key={product.id} className="flex-shrink-0" style={{ width: "250px" }}>
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="position-relative" style={{ height: "180px", overflow: "hidden" }}>
                        <img
                          src={product.image_urls?.[0] || "https://via.placeholder.com/300x200?text=Sin+imagen"}
                          className="w-100 h-100 object-fit-cover"
                          alt={product.title}
                        />
                        {userRole !== 'vendedor' && (
                          <button
                            className={`btn btn-sm position-absolute top-0 end-0 m-2 ${
                              isFavorite ? "btn-danger" : "btn-outline-danger"
                            }`}
                            style={{ borderRadius: "50%", width: "36px", height: "36px" }}
                            title={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
                            onClick={() => toggleFavorite(product.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                              <i className="fas fa-heart"></i>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="card-body">
                        <h5 className="card-title text-truncate">{product.title}</h5>
                        <p className="card-text text-muted small mb-2" style={{
                          display: "-webkit-box",
                          WebkitLineClamp: "2",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}>
                          {product.description || "Sin descripción"}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-primary">
                            {product.price} €
                          </span>
                          <Link
                            to={`/product/${product.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Ver más
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};