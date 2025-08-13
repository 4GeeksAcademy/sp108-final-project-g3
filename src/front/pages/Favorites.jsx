import { useEffect } from "react";
import { useFavorites } from "../context/FavoritesContext";

export const Favorites = () => {
  const { favorites, loading, error, fetchFavorites, removeFavorite } = useFavorites();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (loading) return <div className="container mt-4">Cargando favoritos...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Mis favoritos</h2>
      {favorites.length === 0 ? (
        <p>No tienes productos en favoritos.</p>
      ) : (
        <div className="row">
          {favorites.map((product) => (
            <div className="col-md-4 mb-3" key={product.id}>
              <div className="card">
                <img
                  src={product.image_urls?.[0] || "https://via.placeholder.com/250x150"}
                  className="card-img-top"
                  alt={product.title}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.title}</h5>
                  <p className="card-text">{product.description?.slice(0, 100) || "Sin descripción"}</p>
                  <a href={`/product/${product.id}`} className="btn btn-primary btn-sm me-2">
                    Ver más
                  </a>
                  <button
                    onClick={() => removeFavorite(product.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <i className="fa-solid fa-heart-crack"></i> Quitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;