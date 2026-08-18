import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

import "../navbar-footer.css";

export function Navbar() {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  function handleLogoutClick() {
     navigate("/logout");
  }

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
          <button className="logout-button" onClick={handleLogoutClick}> Logout</button>
        </li>
      </ul>
    </nav>
  );
}