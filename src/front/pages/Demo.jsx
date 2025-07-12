import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.

export const Demo = () => {
  // Access the global state and dispatch function using the useGlobalReducer hook.
  const { store, dispatch } = useGlobalReducer()

  return (
    <div className="container">
      <h1 className="text-center text-primary">Demo</h1>
      <br />
      <Link to="/" className="btn btn-primary">Back home</Link>
    </div>
  );
};
