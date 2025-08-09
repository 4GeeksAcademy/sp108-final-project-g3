export const initialStore = () => {
  // Intentamos cargar el usuario desde localStorage para mantener la sesión al refrescar
  const userData = localStorage.getItem("user");
  return {
    message: null,
    user: userData ? JSON.parse(userData) : null,  // Estado global para el usuario (null si no está logueado)
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return { ...store, message: action.payload };

    case "LOGIN":
      // Guardamos en estado y localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
      return { ...store, user: action.payload };

    case "LOGOUT":
      // Borramos estado y localStorage
      localStorage.removeItem("user");
      return { ...store, user: null };

    default:
      throw new Error("Unknown action.");
  }
}
