import { Link, useParams } from "react-router-dom";  // To use link for navigation and useParams to get URL parameters
import useGlobalReducer from "../hooks/useGlobalReducer";  // Import a custom hook for accessing the global state


export const Single = props => {
  const { store } = useGlobalReducer()  // Access the global state using the custom hook.
  const { theId } = useParams()  // Retrieve the 'theId' URL parameter using useParams hook.

  return (
    <div className="container text-center">
      <h1 className="display-4">{`Todo: ${theId}`}</h1>
      <hr className="my-4" />
      <Link to="/">
        <span className="btn btn-primary btn-lg" href="#" role="button">Back home</span>
      </Link>
    </div>
  );
};
