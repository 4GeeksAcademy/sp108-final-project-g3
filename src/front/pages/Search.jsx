import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const SearchResults = () => {
  const { search } = useLocation(); // Lee ?q=producto
  const params = new URLSearchParams(search);
  const searchTerm = params.get("q");

  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);

  const fetchResults = async () => {
    let url = `${API_URL}/api/products?q=${searchTerm}`;
    if (category) url += `&category=${category}`;

    const res = await fetch(url);
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => {
    if (searchTerm) fetchResults();
  }, [searchTerm, category]);

  return (
    <div className="container mt-4">
      <h4>Resultados para: "{searchTerm}"</h4>

      {/* Filtros */}
      <div className="mb-3">
        <label className="me-2">Filtrar por categoría:</label>
        <select
          className="form-select"
          style={{ maxWidth: "300px" }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="ropa">Título</option>
          <option value="tecnologia">Precio</option>
          <option value="hogar">Localización</option>
        </select>
      </div>

      {/* Resultados */}
      <div className="row">
        {products.length === 0 ? (
          <p>No se encontraron productos.</p>
        ) : (
          products.map((product) => (
            <div className="col-md-4 mb-3" key={product.id}>
              <div className="card">
                <img src={product.image_url} className="card-img-top" alt={product.title} />
                <div className="card-body">
                  <h5>{product.title}</h5>
                  <p>${product.price}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;
