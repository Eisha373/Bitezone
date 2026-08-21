import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export function AdminNavbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleLogoutClick() {
    navigate("/logout");
  }

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand">
        Bitezone <span className="admin-tag">Admin</span>
      </div>
      <ul className="admin-navbar-links">
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/products">Products</Link></li>
        <li><Link to="/admin/orders">Orders</Link></li>
        <li><Link to="/admin/history">Order history</Link></li>

        <li
          className="nav-dropdown"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <span className="nav-dropdown-label">More ▾</span>
          {dropdownOpen && (
            <ul className="nav-dropdown-menu">
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/my-orders">My Orders</Link></li>
            </ul>
          )}
        </li>

        <li>
          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}