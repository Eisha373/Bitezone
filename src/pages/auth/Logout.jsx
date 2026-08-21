import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

import "../../auth.css";

export function Logout() {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = user.role === "admin";

  function handleConfirmLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearCart();
    navigate("/login");
  }
  function handleCancelLogout() {
    navigate(-1);
  }

  return (
    <div className="auth-container">
      <div className={`auth-card logout-card ${isAdmin ? "theme-admin" : "theme-customer"}`}>
        <p>Are you sure you want to logout?</p>
        <div className="logout-actions">
          <button className="logout-cancel-btn" onClick={handleCancelLogout}>
            Cancel
          </button>
          <button className="logout-confirm-btn" onClick={handleConfirmLogout}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}