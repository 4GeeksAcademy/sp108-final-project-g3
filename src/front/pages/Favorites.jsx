import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Favorites = () => {
    const { store } = useGlobalReducer();
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    const fetchFavorites = async () => {
        try {
            const res = await fetch(`${API_URL}/api/favorites`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Error cargando favoritos");
            const data = await res.json();
            setFavorites(data.results || []);
        } catch (err) {
            console.error("Error al obtener favoritos:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (favoriteId) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este producto de favoritos?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${API_URL}/api/favorites/${favoriteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("No se pudo eliminar el favorito");
            setFavorites(favorites.filter(fav => fav.favorite_id !== favoriteId));
        } catch (err) {
            console.error("Error al eliminar favorito:", err.message);
            setError(err.message);
        }
    };

    useEffect(() => {
        if (token) {
            fetchFavorites();
        } else {
            setLoading(false);
            setError("Debes iniciar sesión para ver tus favoritos");
        }
    }, []);

    if (loading) return <div className="container mt-4">Cargando favoritos...</div>;
    if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Mis favoritos</h2>
            {favorites.length === 0 ? (
                <div className="alert alert-info">No tienes productos en favoritos.</div>
            ) : (
                <div className="row">
                    {favorites.map(({ favorite_id, product }) => (
                        <div className="col-md-4 mb-4" key={favorite_id}>
                            <div className="card h-100">
                                {product.image_urls?.length > 0 ? (
                                    <img
                                        src={product.image_urls[0]}
                                        className="card-img-top"
                                        alt={product.title}
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
                                        <span className="text-muted">Sin imagen</span>
                                    </div>
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{product.title}</h5>
                                    <p className="card-text text-muted">{product.price} €</p>
                                    <p className="card-text">
                                        {product.description?.slice(0, 100) || "Sin descripción"}...
                                    </p>
                                    <div className="mt-auto d-flex justify-content-between">
                                        <a 
                                            href={`/product/${product.id}`} 
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            Ver detalles
                                        </a>
                                        <button
                                            onClick={() => removeFavorite(favorite_id)}
                                            className="btn btn-outline-danger btn-sm"
                                            title="Quitar de favoritos"
                                        >
                                            <i className="fas fa-heart-broken"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};