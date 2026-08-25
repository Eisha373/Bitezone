
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export function AdminNavbar() {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function handleLogoutClick() {
    navigate("/logout");
  }

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

        <li>
          <Link to="/admin/orders">Orders</Link>
        </li>

        <li>
          <Link to="/admin/history">Order History</Link>
        </li>

        {/* More Dropdown */}
        <li
          className="nav-dropdown"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <span className="nav-dropdown-label">
            More ▾

            {cartCount > 0 && (
              <span className="more-badge">
                {cartCount}
              </span>
            )}
          </span>

          {dropdownOpen && (
            <ul className="nav-dropdown-menu">

              <li>
                <Link to="/menu">
                  Menu
                </Link>
              </li>

              <li>
                <Link to="/cart">
                  Cart
                  {cartCount > 0 && (
                    <span className="cart-badge">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>

              <li>
                <Link to="/my-orders">
                  My Orders
                </Link>
              </li>

            </ul>
          )}
        </li>

        <li>
          <button
            className="logout-btn"
            onClick={handleLogoutClick}
          >
            Logout
          </button>
        </li>

      </ul>
    </nav>
  );
}
