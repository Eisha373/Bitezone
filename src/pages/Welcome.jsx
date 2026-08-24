import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import "../welcome.css";

export function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user")) || {};

    if (token) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/menu");
      }
    }
  }, [navigate]);

  return (
    <div className="welcome-container">
      <div className="welcome-overlay">
        <h1 className="welcome-heading">Welcome to Bitezone</h1>
        <p className="welcome-subtext">
          Real food, real fast — order in seconds, savor every bite.
        </p>
        <div className="welcome-actions">
          <Link to="/login">
            <button className="welcome-btn primary">
              <FiLogIn /> Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="welcome-btn secondary">
              <FiUserPlus /> Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}