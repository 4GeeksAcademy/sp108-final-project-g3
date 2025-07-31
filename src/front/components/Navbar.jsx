import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/img/treedia-small.png";

export const Navbar = () => {
  const [search, setSearch] = useState("");

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`Buscando: ${search}`);
  };

  return (
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

        {/* Botones */}
        <div className="d-flex align-items-center gap-2">
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
        </div>
      </div>
    </nav>
  );
};
