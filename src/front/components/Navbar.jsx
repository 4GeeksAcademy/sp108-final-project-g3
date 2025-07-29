import { Link } from "react-router-dom";
import treediaImageUrl from "../assets/img/treedia.png";
import { useState } from "react";

export const Navbar = () => {
	const [search, setSearch] = useState("");

	const handleSearchChange = (e) => {
		setSearch(e.target.value);};

	const handleSearchSubmit = (e) => {
		e.preventDefault();
	
		alert(`Buscando: ${search}`);};

	return (
		<nav className="navbar navbar-light bg-white border-bottom px-3">
			<div className="container d-flex align-items-center justify-content-between">
				
				<Link to="/" className="navbar-brand d-flex align-items-center"><img src={treediaImageUrl} alt="Logo" style={{ height: '100px' }} /></Link>


				<form className="flex-grow-1 mx-3" onSubmit={handleSearchSubmit} style={{ maxWidth: '600px' }}>
					<div className="input-group"><input type="text" className="form-control" placeholder="¿Qué estás buscando?" value={search} onChange={handleSearchChange}/>
						<button className="btn btn-outline-secondary" type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>

						
						<div className="btn-group"><button type="button" className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" >Categories</button>
							<ul className="dropdown-menu dropdown-menu-end">
								<li><button className="dropdown-item" onClick={() => alert("1")}>1</button></li>
								<li><button className="dropdown-item" onClick={() => alert("2")}>2</button></li>
								<li><button className="dropdown-item" onClick={() => alert("3")}>3</button></li>
								<li><button className="dropdown-item" onClick={() => alert("4")}>4</button></li>
								<li><button className="dropdown-item" onClick={() => alert("5")}>5</button></li>
							</ul>
						</div>
					</div>
				</form>

				<div className="d-flex align-items-center gap-3">
					<Link to="/favorites" className="btn btn-link position-relative"><i class="fa-solid fa-heart fa-xl" ></i></Link>

					<Link to="/notifications" className="btn btn-link position-relative"><i class="fa-regular fa-bell fa-xl " ></i></Link>

					<Link to="/profile" className="btn btn-link"><i class="fa-solid fa-user fa-xl" ></i></Link>
				</div>
			</div>
		</nav>
	);
};




















