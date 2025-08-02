export const SubNavbar = () => {

    return (
        <nav className="navbar navbar-expand-sm bg-body-tertiary">
            <div className="container-fluid">

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Todas las categorias
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">Ver Todo</a></li>
                                <li><a className="dropdown-item" href="#"><i class="fa-solid fa-car"></i> Coches</a></li>
                                <li><a className="dropdown-item" href="#"> <i class="fa-solid fa-motorcycle"></i> Motos</a></li>
                                <li><a className="dropdown-item" href="#"> <i class="fa-solid fa-helmet-un"></i> Motor y accesorios</a></li>
                                <li><a className="dropdown-item" href="#"> <i class="fa-solid fa-shirt"></i> Moda y accesorios</a></li>
                                <li><a className="dropdown-item" href="#"> <i class="fa-solid fa-house"></i> Inmobiliaria</a></li>
                                <li><a className="dropdown-item" href="#"> <i class="fa-solid fa-plug"></i> Tecnología y Electrónica</a></li>
                                <li><a className="dropdown-item" href="#"> <i class="fa-solid fa-phone"></i> Móviles y tecnología</a></li>
                                <li><a className="dropdown-item" href="#"> <i class="fa-solid fa-computer"></i> Informática</a></li>
                                <li><a className="dropdown-item" href="#"> <i class="fa-solid fa-baseball-bat-ball"></i>  Deporte y ocio</a></li>
                                <li><a className="dropdown-item" href="#"> <i class="fa-solid fa-bicycle"></i> Bicicletas</a></li>
                                <li><hr className="dropdown-divider" /></li>

                            </ul>
                        </li>
                    </ul>
                    <ul className="nav justify-content-center">
                        
                        <li className="nav-item">
                            <a className="nav-link" href="#">Coches</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Motos</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Motor y accesorios</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Moda y accesorios</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Inmobiliaria</a>
                        </li>
                    </ul>



                </div>
            </div>
        </nav>
    )



}
