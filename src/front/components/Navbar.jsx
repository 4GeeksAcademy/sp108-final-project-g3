import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logo from "../assets/img/treedia-small.png";

export const Navbar = () => {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { dispatch, store } = useGlobalReducer();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const handleSearchChange = (e) => setSearch(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = search.trim();
    if (query.length > 0) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    dispatch({ type: "LOGOUT" });
    navigate("/login", {
      state: { successMessage: "Has cerrado sesión correctamente." },
    });
  };

  // 🔹 Obtener cantidad de mensajes no leídos
  const fetchUnreadMessages = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Error cargando mensajes");
      const data = await res.json();

      // Filtrar mensajes no leídos (ajusta la propiedad según tu backend)
      const unread = data.messages?.filter((msg) => msg.read === false).length || 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error al obtener mensajes no leídos:", err.message);
    }
  };

  useEffect(() => {
    fetchUnreadMessages();

    // Opcional: refrescar cada 30s para ver si hay mensajes nuevos
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>
        {`
          .nav-icon-link {
            color: #0d6efd;
            transition: color 0.2s ease, text-decoration-color 0.2s ease;
            position: relative;
          }
          .nav-icon-link:hover {
            color: #084298;
            text-decoration: underline;
            cursor: pointer;
          }
          .unread-badge {
            position: absolute;
            top: -5px;
            right: -10px;
            background: red;
            color: white;
            border-radius: 50%;
            font-size: 0.75rem;
            padding: 2px 6px;
            font-weight: bold;
          }
        `}
      </style>

      <nav className="bg-white shadow-sm py-2">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            {/* Logo */}
            <Link to="/" className="d-flex align-items-center">
              <img src={logo} alt="Logo" style={{ height: "50px" }} />
            </Link>

            {/* Toggle (hamburguesa) para móvil */}
            <button
              className="btn d-md-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <i className="fa-solid fa-bars"></i>
            </button>

            {/* Buscador en pantallas md+ */}
            <form
              onSubmit={handleSearchSubmit}
              className="d-none d-md-flex flex-grow-1 mx-3"
              style={{ maxWidth: "600px" }}
            >
              <div className="input-group rounded-pill border overflow-hidden">
                <span className="input-group-text bg-white border-0">
                  <i className="fa-solid fa-magnifying-glass text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none"
                  placeholder="Buscar productos o marcas"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </form>

            {/* Botones en pantallas md+ */}
            <div className="d-none d-md-flex align-items-center gap-4">
              {store.user ? (
                <>
                  <Link to="/favorites" className="nav-icon-link text-decoration-none">
                    <i className="fa-regular fa-heart"></i> <span>Favoritos</span>
                  </Link>

                  <Link to="/messages" className="nav-icon-link text-decoration-none">
                    <i className="fa-solid fa-envelope"></i>
                    {unreadCount > 0 && (
                      <span className="unread-badge">{unreadCount}</span>
                    )}
                    <span className="ms-1">Buzón</span>
                  </Link>

                  <Link to="/dashboard" className="nav-icon-link text-decoration-none">
                    <i className="fa-regular fa-user"></i> <span>Tú</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger rounded-pill px-3 fw-semibold"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn btn-outline-primary rounded-pill px-3 fw-semibold"
                  >
                    Registrarse
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-primary rounded-pill px-3 fw-semibold text-white"
                  >
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Menú colapsado visible solo en móvil */}
          {menuOpen && (
            <div className="d-md-none mt-3">
              <form onSubmit={handleSearchSubmit} className="mb-3">
                <div className="input-group rounded-pill border overflow-hidden">
                  <span className="input-group-text bg-white border-0">
                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 shadow-none"
                    placeholder="Buscar productos o marcas"
                    value={search}
                    onChange={handleSearchChange}
                  />
                </div>
              </form>

              <div className="d-flex flex-column gap-2">
                {store.user ? (
                  <>
                    <Link to="/favorites" className="nav-icon-link text-decoration-none">
                      <i className="fa-regular fa-heart"></i> Favoritos
                    </Link>
                    <Link to="/messages" className="nav-icon-link text-decoration-none">
                      <i className="fa-solid fa-envelope"></i>
                      {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                      )}
                      <span className="ms-1">Buzón</span>
                    </Link>
                    <Link to="/dashboard" className="nav-icon-link text-decoration-none">
                      <i className="fa-regular fa-user"></i> Tú
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="btn btn-outline-danger rounded-pill fw-semibold"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn btn-outline-primary rounded-pill fw-semibold"
                    >
                      Registrarse
                    </Link>
                    <Link
                      to="/login"
                      className="btn btn-primary rounded-pill fw-semibold text-white"
                    >
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
