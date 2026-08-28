import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { NotificationBell } from "./NotificationBell"; // add this

export function AdminNavbar() {
  const { cartItems } = useCart();
  const user = JSON.parse(localStorage.getItem("user"));
  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  const [ordersDropdownOpen, setOrdersDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand">
        Bitezone <span className="admin-tag">Admin</span>
      </div>

      <ul className="admin-navbar-links">
        <li>
          <Link to="/admin/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link to="/admin/products">Products</Link>
        </li>

        {/* More Dropdown */}
        <li
          className="nav-dropdown"
          onMouseEnter={() => setMoreDropdownOpen(true)}
          onMouseLeave={() => setMoreDropdownOpen(false)}
        >
          <span className="nav-dropdown-label">
            More ▾
            {cartCount > 0 && <span className="more-badge">{cartCount}</span>}
          </span>

          {moreDropdownOpen && (
            <ul className="nav-dropdown-menu">
              <li>
                <Link to="/menu">Menu</Link>
              </li>
              <li>
                <Link to="/cart">
                  Cart
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
              </li>
              <li>
                <Link to="/my-orders">My Orders</Link>
              </li>
              <li
                className="nav-dropdown"
                onMouseEnter={() => setOrdersDropdownOpen(true)}
                onMouseLeave={() => setOrdersDropdownOpen(false)}
              >
                <span className="nav-dropdown-label">Orders ▾</span>

                {ordersDropdownOpen && (
                  <ul className="nav-dropdown-menu">
                    <li>
                      <Link to="/admin/orders">Track Orders</Link>
                    </li>
                    <li>
                      <Link to="/admin/history">Order History</Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          )}
        </li>

        <li>
          <NotificationBell />
        </li>

        <li>
          <Link to="/profile" className="navbar-avatar">
            {initial}
          </Link>
        </li>
      </ul>
    </nav>
  );
}