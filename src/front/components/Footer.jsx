import { Link } from "react-router-dom";
import logo from "../assets/img/treedia-small.png";

export const Footer = () => {
  return (
    <footer className="bg-white border-top mt-5 pt-4 pb-4">
      <div className="container text-center">
        <Link to="/" className="d-inline-block mb-2">
          <img src={logo} alt="Treedia logo" style={{ height: "40px" }} />
        </Link>
            <p className="text-muted small mb-0">
          Treedia &copy; 2025
        </p>
      </div>
    </footer>
  );
};
