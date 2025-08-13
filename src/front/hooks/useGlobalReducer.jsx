// src/front/hooks/useGlobalReducer.jsx
import { useContext, useReducer, createContext, useEffect } from "react";
import storeReducer, { initialStore } from "../store.js"; // Ajustar la importación

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [store, dispatch] = useReducer(storeReducer, initialStore());

  useEffect(() => {
    // Lee el objeto user desde localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      dispatch({
        type: "LOGIN",
        payload: JSON.parse(userData),
      });
    }
  }, []); // Solo al montar

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export default function useGlobalReducer() {
  const { dispatch, store } = useContext(StoreContext);
  return { dispatch, store };
}