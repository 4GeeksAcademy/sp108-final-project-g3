import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Favorites = () => {
    const { store } = useGlobalReducer();
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

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
            setFavorites(data.favorites || []);
        } catch (err) {
            console.error("Error al obtener favoritos:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (productId) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este producto de favoritos?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${API_URL}/api/favorites/${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("No se pudo eliminar el favorito");
            setFavorites(favorites.filter(p => p.id !== productId));
        } catch (err) {
            console.error("Error al eliminar favorito:", err.message);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    if (loading) return <div className="container mt-4">Cargando favoritos...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Mis favoritos</h2>
            {favorites.length === 0 ? (
                <p>No tienes productos en favoritos.</p>
            ) : (
                <div className="row">
                    {favorites.map(product => (
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
                                    <a href={`/product/${product.id}`} className="btn btn-primary btn-sm me-2">Ver más</a>
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
