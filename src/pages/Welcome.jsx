import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
          Cravings, delivered fast — your favorite food is just a few clicks away.
        </p>
        <div className="welcome-actions">
          <div>
     <p className="welcome-helper-text">Already have an account?</p>
            <Link to="/login">
              <button className="welcome-btn primary">Login</button>
            </Link>
          </div>

          <div>
                 <p className="welcome-helper-text">New here? Sign up to continue</p>
            <Link to="/signup">
              <button className="welcome-btn secondary">Sign Up</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}