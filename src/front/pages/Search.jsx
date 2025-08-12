import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const SearchResults = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const searchTerm = params.get("q") || "";

  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    let url = `${API_URL}/api/products?q=${encodeURIComponent(searchTerm)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (tags) url += `&tags=${encodeURIComponent(tags)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al cargar los productos");
      }
      setProducts(data.results || []);
    } catch (err) {
      setError(err.message || "Error de conexión. Inténtalo de nuevo.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      fetchResults();
    } else {
      setProducts([]);
    }
  }, [searchTerm, category, tags]);

  return (
    <div className="container mt-4">
      <h4>Resultados para: "{searchTerm || "Todos los productos"}"</h4>

      <div className="mb-3 d-flex gap-3">
        <div>
          <label className="me-2" style={{ fontWeight: "bold" }}>
            Filtrar por categoría:
          </label>
          <select
            className="form-select"
            style={{ maxWidth: "300px" }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas</option>
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
        <div>
          <label className="me-2" style={{ fontWeight: "bold" }}>
            Filtrar por estado:
          </label>
          <select
            className="form-select"
            style={{ maxWidth: "300px" }}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="new">Nuevo</option>
            <option value="used">Usado</option>
            <option value="acceptable">Aceptable</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-center">Cargando productos...</div>}

      <div className="row">
        {products.length === 0 && !loading && !error ? (
          <p>No se encontraron productos.</p>
        ) : (
          products.map((product) => (
            <div className="col-md-4 mb-3" key={product.id}>
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
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;