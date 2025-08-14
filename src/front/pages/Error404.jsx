import { useNavigate } from "react-router-dom";

export const Error404 = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      <h1 className="text-9xl font-extrabold text-red-500 mb-5">404</h1>
      <h2 className="text-3xl font-bold mb-2">¡Oops! Página no encontrada</h2>
      <p className="text-gray-700 mb-5 text-center max-w-md">
        Intenta regresar al inicio.
      </p>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={handleGoHome}
      >
        Volver al Inicio
      </button>
    </div>
  );
};
