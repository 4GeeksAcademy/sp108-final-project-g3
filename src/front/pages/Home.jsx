import { useEffect, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
	const { store, dispatch } = useGlobalReducer();
	const scrollRef = useRef(null);
	const cards = [1, 2, 3, 4, 5, 6, 7];

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			if (!backendUrl) {
				throw new Error('VITE_BACKEND_URL is not defined in .env file');
			}
			const response = await fetch(`${backendUrl}/api/hello`);
			if (response.ok) {
				const data = await response.json();
				dispatch({ type: 'set_hello', payload: data.message });
				return data;
			}
		} catch (error) {
			console.error("Error fetching message:", error.message);
		}
	};

	useEffect(() => {
		loadMessage();
	}, []);

	const scroll = (direction) => {
		if (scrollRef.current) {
			const amount = direction === "left" ? -300 : 300;
			scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
		}
	};

	return (
		<>
			{/* Carrusel principal */}
			<div
				id="carouselExampleSlidesOnly"
				className="carousel slide"
				data-bs-ride="carousel"
				data-bs-interval="3000"
			>
				<div className="carousel-inner">
					<div className="carousel-item active position-relative">
						<div style={{ height: "300px", backgroundColor: "#c96445ff", position: "relative", overflow: "hidden" }}>
							<div className="position-relative z-2 text-white d-flex align-items-center" style={{ width: "50%", height: "100%", paddingLeft: "2rem" }}>
								<div>
									<h5>Moda deportiva</h5>
									<p>Para estar estupendo en cada ocasión</p>
									<button className="btn btn-primary" type="submit">Comprar</button>
								</div>
							</div>
							<img
								src="https://img.freepik.com/foto-gratis/mujeres-tiro-medio-colchonetas-yoga_23-2149161281.jpg"
								alt="Sport"
								className="position-absolute top-0 end-0 h-100"
								style={{ width: "900px", objectFit: "cover", zIndex: 1 }}
							/>
						</div>
					</div>

					<div className="carousel-item position-relative">
						<div style={{ height: "300px", backgroundColor: "#c96445ff", position: "relative", overflow: "hidden" }}>
							<div className="position-relative z-2 text-white d-flex align-items-center" style={{ width: "50%", height: "100%", paddingLeft: "2rem" }}>
								<div>
									<h5>Vida al aire libre</h5>
									<p>Conéctate con la naturaleza</p>
									<button className="btn btn-primary" type="submit">Vender</button>
								</div>
							</div>
							<img
								src="https://www.salvaje.com.uy/wp-content/uploads/2018/06/Untitledddd-1.jpg"
								alt="Nature"
								className="position-absolute top-0 end-0 h-100"
								style={{ width: "900px", objectFit: "cover", zIndex: 1 }}
							/>
						</div>
					</div>

					<div className="carousel-item position-relative">
						<div style={{ height: "300px", backgroundColor: "#c96445ff", position: "relative", overflow: "hidden" }}>
							<div className="position-relative z-2 text-white d-flex align-items-center" style={{ width: "50%", height: "100%", paddingLeft: "2rem" }}>
								<div>
									<h5>Momentos especiales</h5>
									<p>Comparte lo que amás</p>
									<button className="btn btn-primary" type="submit">Saber más</button>
								</div>
							</div>
							<img
								src="https://www.shutterstock.com/image-photo/charming-funny-mixed-race-couple-260nw-1746243686.jpg"
								alt="Love"
								className="position-absolute top-0 end-0 h-100"
								style={{ width: "900px", objectFit: "cover", zIndex: 1 }}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Últimos productos con scroll y flechas */}
			<div className="container mt-5 position-relative">
				<h2 className="mb-4">Últimos productos</h2>

				{/* Botones flecha */}
				<button
					className="btn btn-light position-absolute top-50 start-0 translate-middle-y z-3"
					style={{ borderRadius: "50%" }}
					onClick={() => scroll("left")}
				>
					<span className="carousel-control-prev-icon" />
				</button>
				<button
					className="btn btn-light position-absolute top-50 end-0 translate-middle-y z-3"
					style={{ borderRadius: "50%" }}
					onClick={() => scroll("right")}
				>
					<span className="carousel-control-next-icon" />
				</button>

				{/* Scroll horizontal con tarjetas */}
				<div
					ref={scrollRef}
					className="d-flex overflow-auto gap-3 pb-3"
					style={{ scrollBehavior: "smooth" }}
				>
					{cards.map((item) => (
						<div
							key={item}
							className="card flex-shrink-0 border-dark bg-white text-dark"
							style={{
								width: "250px",
								minWidth: "250px",
								margin: "0 0.5rem"
							}}
						>
							<img
								src="https://via.placeholder.com/250x150"
								className="card-img-top"
								alt={`Producto ${item}`}
							/>
							<div className="card-body">
								<h5 className="card-title">Producto {item}</h5>
								<p className="card-text">Descripción breve del producto número {item}.</p>
								<a href="#" className="btn btn-primary">Ver más</a>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
};
