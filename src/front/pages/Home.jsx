import { useEffect, useRef, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
  const { dispatch } = useGlobalReducer();
  const scrollRef = useRef(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const [latestProducts, setLatestProducts] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

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

      setLatestProducts(products.slice(0, 5));
    } catch (error) {
      console.error("Error al cargar últimos productos:", error);
    }
  };

  useEffect(() => {
    loadMessage();
    fetchLatestProducts();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      const confirmed = window.confirm(
        "¿Está seguro que desea eliminar su producto de favoritos?"
      );
      if (confirmed) {
        setFavorites(favorites.filter((id) => id !== productId));
      }
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  return (
    <>
      {/* Carrusel principal */}
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

      {/* Últimos productos con scroll y flechas */}
      <div className="container mt-5 position-relative">
        <h2 className="mb-4">Últimos productos</h2>

        {/* Botones flecha */}
        <button
          className="btn btn-light position-absolute top-50 start-0 translate-middle-y z-3"
          style={{ borderRadius: "50%" }}
          onClick={() => scroll("left")}
        >
          <span className="carousel-control-prev-icon" />
        </button>
        <button
          className="btn btn-light position-absolute top-50 end-0 translate-middle-y z-3"
          style={{ borderRadius: "50%" }}
          onClick={() => scroll("right")}
        >
          <span className="carousel-control-next-icon" />
        </button>

        {/* Scroll horizontal con tarjetas */}
        <div
          ref={scrollRef}
          className="d-flex overflow-auto gap-3 pb-3"
          style={{ scrollBehavior: "smooth" }}
        >
          {latestProducts.map((product) => {
            const isFavorite = favorites.includes(product.id);
            return (
              <div
                key={product.id}
                className="card flex-shrink-0 border-dark bg-white text-dark"
                style={{
                  width: "180px",
                  minWidth: "180px",
                  margin: "0 0.5rem",
                  fontSize: "0.85rem",
                }}
              >
                <img
                  src={
                    product.image_urls?.[0] || "https://via.placeholder.com/250x150"
                  }
                  className="card-img-top"
                  alt={product.title}
                  style={{
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                <div className="card-body" style={{ padding: "0.5rem" }}>
                  <h5
                    className="card-title"
                    style={{ fontSize: "1rem", marginBottom: "0.3rem" }}
                  >
                    {product.title}
                  </h5>
                  <p
                    className="card-text"
                    style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}
                  >
                    {product.description?.slice(0, 50) || "Sin descripción"}
                  </p>
                  <div className="d-flex align-items-center justify-content-between">
                    <a
                      href={`/product/${product.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      Ver más
                    </a>
                    <button
                      className={`btn btn-sm ${
                        isFavorite ? "btn-danger" : "btn-outline-danger"
                      }`}
                      title={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <i className="fa-solid fa-heart"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
