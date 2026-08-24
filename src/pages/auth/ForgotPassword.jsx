import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../auth.css";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setMessage("Reset link generated. Redirecting...");

      setTimeout(() => {
        navigate(`/reset-password/${data.resetToken}`);
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#555", marginBottom: "10px" }}>
          Enter your email and we'll help you reset your password.
        </p>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
        <p>Remembered your password? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}