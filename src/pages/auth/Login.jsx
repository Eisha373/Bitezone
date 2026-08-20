import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "../../auth.css";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault(); 
      setError("");
      setEmailError("");
  setPasswordError("");

  let hasError = false;
  if (!email) {
    setEmailError("Please enter your email");
    hasError = true;
  }
  if (!password) {
    setPasswordError("Please enter your password");
    hasError = true;
  }
  if (hasError) 
    return;

  try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/menu");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/images/burger-logo(1).jpg" alt="Bitezone Logo" className="auth-logo" />
        <h2>Welcome to Bitezone</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        //added noValidate attribute to avoid browser default popup

        <form onSubmit={handleLogin} noValidate>
          <label htmlFor="email">Email:</label>
<div className="field-wrapper">
  <input
    type="email"
    id="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  //added customized popup for email field

  {emailError && (
    <div className="field-popup">
      <span className="field-popup-icon">!</span>
      <span>{emailError}</span>
    </div>
  )}
</div>

<label htmlFor="password">Password:</label>
<div className="field-wrapper">
  <input
    type="password"
    id="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  //added customized popup for password field
  {passwordError && (
    <div className="field-popup">
      <span className="field-popup-icon">!</span>
      <span>{passwordError}</span>
    </div>
  )}
</div>
          <button
    type="button"
    className="toggle-password-btn"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </button>

          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
}