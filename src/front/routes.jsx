import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "./pages/Layout.jsx";
import { Home } from "./pages/Home.jsx";
import { Single } from "./pages/Single.jsx";
import { Demo } from "./pages/Demo.jsx";
import { Error404 } from "./pages/Error404.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Search from "./pages/Search.jsx";



/* 
CreateRoutesFromElements function allows you to build route elements declaratively.
Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
Root, on the contrary, create a sister Route, if you have doubts, try it!
Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.
*/
export const router = createBrowserRouter (
    createRoutesFromElements (
      // Root Route: All navigation will start from here.
      <Route path="/" element={<Layout />} errorElement={<Error404/>} >
        <Route path= "/" element={<Home />} />
        <Route path="/single/:theId" element={ <Single />} />
        <Route path="/demo" element={<Demo />} />
         <Route path="/search" element={<Search />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    )
);
