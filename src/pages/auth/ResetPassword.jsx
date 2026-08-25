import  { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../auth.css";

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" | "error"
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (confirmPasswordError) setConfirmPasswordError("");
  };

  const handlePasswordBlur = () => {
    if (password.length > 0 && password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword.length > 0 && confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
    }
  };

  const validateForm = () => {
    let valid = true;

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setStatusType("success");
        setStatusMessage("Password reset successful. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setStatusType("error");
        setStatusMessage(data.message || "Something went wrong");
      }
    } catch(err) {
      setStatusType("error");
      setStatusMessage(err.message||"Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="auth-container">
    <div className="auth-card">
      <form onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        <label htmlFor="password">New Password:</label>
        <div className="field-wrapper">
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordError && (
            <div className="field-popup">
              <span className="field-popup-icon">!</span>
              <span>{passwordError}</span>
            </div>
          )}
        </div>

        <label htmlFor="confirmPassword">Confirm Password:</label>
        <div className="field-wrapper">
          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {confirmPasswordError && (
            <div className="field-popup">
              <span className="field-popup-icon">!</span>
              <span>{confirmPasswordError}</span>
            </div>
          )}
        </div>

        {statusMessage && (
          <p className={`status-message ${statusType}`}>{statusMessage}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  </div>
);
}