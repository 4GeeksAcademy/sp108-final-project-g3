import { createContext, useContext, useState } from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado.");
      setFavorites([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Error al cargar favoritos");
      }
      const data = await res.json();
      setFavorites(data.results || []);
    } catch (err) {
      console.error("Error al obtener favoritos:", err.message);
      setError(err.message || "Error al cargar favoritos");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este producto de favoritos?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/favorites/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("No se pudo eliminar el favorito");
      await fetchFavorites();
    } catch (err) {
      console.error("Error al eliminar favorito:", err.message);
      setError(err.message || "Error al eliminar favorito");
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, loading, error, fetchFavorites, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);