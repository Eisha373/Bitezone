import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Welcome } from "./pages/Welcome";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { Logout } from "./pages/auth/Logout";
import { Home } from "./pages/customer/Home";
import { Cart } from "./pages/customer/Cart";
import { Checkout } from "./pages/customer/Checkout";
import { MyOrders } from "./pages/customer/MyOrders";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { OrderHistory } from "./pages/admin/OrderHistory";
import { OrdersList } from "./pages/admin/OrdersList";
import { OrderTracking } from "./pages/customer/OrderTracking";
import { CartProvider } from "./context/CartContext";
import { ProductsManagement } from "./pages/admin/ProductsManagement";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import {ResetPassword} from "./pages/auth/ResetPassword";
import "./welcome.css";
import "./auth.css";
import "./home.css";
import "./navbar-footer.css";
import "./cart.css";
import "./checkout.css";
import "./order.css";
import "./admin-navbar.css";
import "./admin.css";
import "./App.css";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/Welcome" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/menu" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/history" element={<OrderHistory />} />
          <Route path="/order-tracking/:id" element={<OrderTracking />} />
          <Route path="/admin/orders" element={<OrdersList />} />
          <Route path="/admin/products" element={<ProductsManagement />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
export default App;