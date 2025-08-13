// src/front/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes.jsx";
import { BackendURL } from "./components/BackendURL.jsx";
import { FavoritesProvider } from "./context/FavoritesContext";
import { StoreProvider } from "./hooks/useGlobalReducer";
import "./index.css"; // Importar el archivo CSS existente (aunque esté vacío)

const Main = () => {
  if (!import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL === "") {
    return <BackendURL />;
  }

  return (
    <StoreProvider>
      <FavoritesProvider>
        <RouterProvider router={router} />
      </FavoritesProvider>
    </StoreProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);