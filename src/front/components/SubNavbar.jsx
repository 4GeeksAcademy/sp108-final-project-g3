export const SubNavbar = () => {
  return (
    <nav className="navbar navbar-expand-sm bg-light border-top border-bottom shadow-sm">
      <div className="container">
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav d-flex align-items-center gap-3">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle fw-semibold"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fa-solid fa-list me-2"></i>
                Todas las categorías
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#">Ver Todo</a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fa-solid fa-car me-2"></i> Coches
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fa-solid fa-motorcycle me-2"></i> Motos
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fa-solid fa-helmet-safety me-2"></i> Motor y accesorios
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fa-solid fa-shirt me-2"></i> Moda y accesorios
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fa-solid fa-house me-2"></i> Inmobiliaria
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fa-solid fa-plug me-2"></i> Tecnología y Electrónica
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fa-solid fa-phone me-2"></i> Móviles y tecnología
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fa-solid fa-computer me-2"></i> Informática
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fa-solid fa-baseball-bat-ball me-2"></i> Deporte y ocio
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fa-solid fa-bicycle me-2"></i> Bicicletas
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
              </ul>
            </li>

            {/* Categorías rápidas */}
            <li className="nav-item">
              <a className="nav-link fw-semibold" href="#">Coches</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold" href="#">Motos</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold" href="#">Motor y accesorios</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold" href="#">Moda y accesorios</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold" href="#">Inmobiliaria</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
