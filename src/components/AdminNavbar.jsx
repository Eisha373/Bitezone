import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function AdminNavbar() {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  function handleLogoutClick() {
    navigate("/logout");
  }

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand">
        <span className="logo">Bitezone</span>
        <span className="admin-tag">Admin</span>
      </div>
      <div className="admin-navbar-links">
        
        <Link to="/admin/dashboard">Dashboard</Link>
                <Link to="/admin/products">Products</Link>

        <Link to="/menu">Menu</Link>
        <Link to="/cart">
          Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
        <Link to="/my-orders">My Orders</Link>

        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/history">Order history</Link>

        <button className="logout-btn" onClick={handleLogoutClick}>Logout</button>
      </div>
    </nav>
  );
}