import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { NotificationBell } from "./NotificationBell"; // add this

import "../navbar-footer.css";

export function Navbar() {
  const { cartItems } = useCart();
  const user = JSON.parse(localStorage.getItem("user"));
  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/menu">Bitezone 🍔</Link>
      </div>
      <ul className="navbar-links">
        <li> <Link to="/menu">Menu</Link></li>
        <li>
          <Link to="/cart">
            Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </li>
        <li><Link to="/my-orders">My Orders</Link></li>
        <li>
          <NotificationBell />
        </li>
        <li>
          <Link to="/profile" className="navbar-avatar-customer">
            {initial}
          </Link>
        </li>
      </ul>
    </nav>
  );
}