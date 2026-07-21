import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import Notifications from "../pages/Notifications";
import DeliveryTracking from "../pages/DeliveryTracking";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />

      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/delivery/:id" element={<DeliveryTracking />} />
    </Routes>
  );
}