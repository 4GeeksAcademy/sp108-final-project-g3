import { useEffect } from "react";
import treediaImageUrl from "../assets/img/treedia.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
	const { store, dispatch } = useGlobalReducer();

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

	return (
		<div className="text-center mt-5">
			<p className="lead">
				<img
					src={treediaImageUrl}
					className="img-fluid rounded-circle mb-3"
					alt="Rigo Baby"
					style={{
						maxWidth: "300px",
						width: "100%",
						height: "auto"
					}}
				/>
			</p>
			{store.message && (
				<div className="alert alert-info">
					<span>{store.message}</span>
				</div>
			)}
		</div>
	);
};
