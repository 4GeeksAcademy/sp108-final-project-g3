import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from "react-router-dom";  // Import RouterProvider to use the router
import { router } from "./routes.jsx";  // Import the router configuration
import { StoreProvider } from './hooks/useGlobalReducer.jsx';  // Import the StoreProvider for global state management
import './index.css'  // Global styles for your application
import { BackendURL } from './components/BackendURL.jsx';


const Main = () => {
    if(! import.meta.env.VITE_BACKEND_URL ||  import.meta.env.VITE_BACKEND_URL == "") return (
        <React.StrictMode>
              <BackendURL/ >
        </React.StrictMode>
        );
    return (
        <React.StrictMode>  
            <StoreProvider> 
                <RouterProvider router={router}>
                </RouterProvider>
            </StoreProvider>
        </React.StrictMode>
    );
}


// Render the Main component into the root DOM element.
ReactDOM.createRoot(document.getElementById('root')).render(<Main />)
