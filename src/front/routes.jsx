// src/front/routes.jsx
// src/front/routes.jsx
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Layout from "./pages/Layout.jsx";
import { Home } from "./pages/Home.jsx";
import { Single } from "./pages/Single.jsx";
import { Demo } from "./pages/Demo.jsx";
import { Error404 } from "./pages/Error404.jsx";
import { Favorites } from "./pages/Favorites.jsx";
import { Messages } from "./pages/Messages.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Search from "./pages/Search.jsx";
import PublishProduct from "./pages/PublishProduct.jsx";
import MyProducts from "./pages/MyProducts.jsx";
import EditProduct from "./pages/EditProduct.jsx";
import Product from "./pages/Product.jsx";
import Profile from "./pages/Profile.jsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<Error404 />}>
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/search" element={<Search />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="/publish-product" element={<PublishProduct />} />
      <Route path="/my-products" element={<MyProducts />} />
      <Route path="/edit-product/:id" element={<EditProduct />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/profile/:user_id" element={<Profile />} />
    </Route>
  )
);