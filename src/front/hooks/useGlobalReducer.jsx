// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext, useEffect } from "react";
import storeReducer, { initialStore } from "../store";  // Import the reducer and the initial state.

// Create a context to hold the global state of the application
// We will call this global state the "store" to avoid confusion while using local states
const StoreContext = createContext();

// Define a provider component that encapsulates the store and warps it in a context provider to 
// broadcast the information throught all the app pages and components.
export function StoreProvider({ children }) {
    // Initialize reducer with the initial state.
    const [store, dispatch] = useReducer(storeReducer, initialStore());

    // On mount, check localStorage to restore user info (persist login)
    useEffect(() => {
        // Lee la info del usuario guardada
        const role = localStorage.getItem("role");
        const first_name = localStorage.getItem("first_name");
        const last_name = localStorage.getItem("last_name");
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("token");

        if (role && token) {
            // Si hay usuario en localStorage, despacha LOGIN para restaurar el estado global
            dispatch({
                type: "LOGIN",
                payload: { role, first_name, last_name, email, token }
            });
        }
    }, []); // Solo al montar

    // Provide the store and dispatch method to all child components.
    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
}

// Custom hook to access the global state and dispatch function.
export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext);
    return { dispatch, store };
}
