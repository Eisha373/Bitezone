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
    <div className="welcome-actions">
  <div className="welcome-action-group">
    <Link to="/login">
      <button className="welcome-btn primary">
        <FiLogIn /> Login
      </button>
    </Link>
    <span className="welcome-action-hint">Already have an account?</span>
  </div>
  <div className="welcome-action-group">
    <Link to="/signup">
      <button className="welcome-btn secondary">
        <FiUserPlus /> Sign Up
      </button>
    </Link>
    <span className="welcome-action-hint">New here? Sign up to continue</span>
  </div>
</div>
  );
}