import { Link } from "react-router-dom";

export const Error404 = () => {
    return (
        <div className="container text-center py-5">
            <h1 className="display-1 fw-bold text-danger">404</h1>
            <h2 className="text-secondary mb-4">Página no encontrada</h2>
            <p className="mb-4">
                Parece que te has perdido... La página que buscas no existe o fue movida.
            </p>
            <Link to="/" className="btn btn-primary btn-lg">
                ⬅ Volver al inicio
            </Link>
        </div>
    );
};
