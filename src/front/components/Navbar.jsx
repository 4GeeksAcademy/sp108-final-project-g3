import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logo from "../assets/img/treedia-small.png";

export const Navbar = () => {
  const [search, setSearch] = useState("");
  const { dispatch, store } = useGlobalReducer();
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`Buscando: ${search}`);
  };

  // Función para cerrar sesión y mostrar mensaje en login
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("email");

    dispatch({ type: "LOGOUT" });
    // Navegar a login enviando mensaje de éxito
    navigate("/login", { state: { successMessage: "Has cerrado sesión correctamente." } });
  };

  return (
    <>
      {/* Estilos para hover */}
      <style>
        {`
          .nav-icon-link {
            color: #0d6efd; /* Bootstrap primary */
            transition: color 0.2s ease, text-decoration-color 0.2s ease;
          }
          .nav-icon-link:hover {
            color: #084298; /* Bootstrap primary dark */
            text-decoration: underline;
            cursor: pointer;
          }
        `}
      </style>

      <nav className="bg-white shadow-sm py-2">
        <div className="container d-flex align-items-center justify-content-between">
          {/* Logo */}
          <Link to="/" className="d-flex align-items-center me-3">
            <img src={logo} alt="Logo" style={{ height: "50px" }} />
          </Link>

          {/* Buscador */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-grow-1 mx-3"
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

          {/* Iconos con texto para usuario logueado o links para invitado */}
          <div className="d-flex align-items-center gap-4">
            {store.user ? (
              <>
                {/* Favoritos */}
                <Link
                  to="/favorites"
                  className="d-flex align-items-center gap-1 nav-icon-link text-decoration-none"
                  title="Favoritos"
                >
                  <i className="fa-regular fa-heart"></i>
                  <span>Favoritos</span>
                </Link>

                {/* Buzón */}
                <Link
                  to="/inbox"
                  className="d-flex align-items-center gap-1 nav-icon-link text-decoration-none"
                  title="Buzón"
                >
                  <i className="fa-solid fa-envelope"></i>
                  <span>Buzón</span>
                </Link>

                {/* Perfil */}
                <Link
                  to="/dashboard"
                  className="d-flex align-items-center gap-1 nav-icon-link text-decoration-none"
                  title="Tu perfil"
                >
                  <i className="fa-regular fa-user"></i>
                  <span>Tú</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger rounded-pill px-3 fw-semibold"
                  title="Cerrar sesión"
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
      </nav>
    </>
  );
};
