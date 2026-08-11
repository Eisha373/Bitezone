import {Link} from "react-router-dom";
export function AdminNavbar(){
  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand">
        <span className="logo">Bitezone</span>
        <span className="admin-tag">Admin</span>
      </div>
      <div className="admin-navbar-links">
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/history">Order history</Link>
        <button className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}
