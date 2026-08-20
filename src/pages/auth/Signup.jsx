import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../auth.css";

/*added valid name, email,phone,password pattern*/

const NAME_PATTERN = /^[A-Za-z\s]{3,50}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// e.g. 03001234567 (11 digits, starts with 03)
const PHONE_PATTERN = /^03\d{9}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  //added usestate for confirm password field
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState("");

  function handleNameChange(e) {
    const value = e.target.value;
    setName(value);

    if (value && !NAME_PATTERN.test(value)) {
      setNameError("Enter a valid name (letters only)");
    } else {
      setNameError("");
    }
  }

  function handleEmailChange(e) {
    const value = e.target.value;
    setEmail(value);

    /*condition to check valid email*/

    if (value && !EMAIL_PATTERN.test(value)) {
      setEmailError("Enter a valid email address, e.g. ali123@example.com");
    } else {
      setEmailError("");
    }
  }

  function handlePhoneChange(e) {
    /* keep only digits, cap at 11 characters as the user types*/

    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(value);

    if (value && !PHONE_PATTERN.test(value)) {
      setPhoneError("Enter an 11-digit number e.g. 03079864522");
    } else {
      setPhoneError("");
    }
  }

  function handlePasswordChange(e) {
    const value = e.target.value;
    setPassword(value);

    if (value && !PASSWORD_PATTERN.test(value)) {
      setPasswordError(
        "Must be 8+ characters with uppercase, lowercase, number & special character"
      );
    } else {
      setPasswordError("");
    }
  }

  {/*added function to handle ConfirmPasswordChange*/}

  function handleConfirmPasswordChange(e) {
    const value = e.target.value;
    setConfirmPassword(value);

    if (!value) {
      setConfirmPasswordError("Please re-enter your password");
    } else if (value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (!NAME_PATTERN.test(name)) {
      setNameError("Enter a valid name (letters only, min 3 characters)");
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      setEmailError("Enter a valid email address, e.g. ali123@example.com");
      return;
    }

    if (!PHONE_PATTERN.test(phone)) {
      setPhoneError("Enter an 11-digit number e.g. 03001234567");
      return;
    }

    if (!PASSWORD_PATTERN.test(password)) {
      setError("Password doesn't meet the required format");
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please re-enter your password");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed");
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
        <h2>Create Account</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {/* noValidate stops the browser's native bubbles so our custom popups
            are the only validation UI the user ever sees */}
        <form onSubmit={handleSignup} noValidate>
          <label htmlFor="full-name">Full Name:</label>
          <div className="field-wrapper">
            <input
              type="text"
              id="full-name"
              placeholder="e.g.Ali Raza"
              value={name}
              onChange={handleNameChange}
              required
            />
            {nameError && (
              <div className="field-popup">
                <span className="field-popup-icon">!</span>
                <span>{nameError}</span>
              </div>
            )}
          </div>

          <label htmlFor="email">Email:</label>
          <div className="field-wrapper">
            <input
              type="email"
              id="email"
              placeholder="e.g.ali123@example.com"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError && (
              <div className="field-popup">
                <span className="field-popup-icon">!</span>
                <span>{emailError}</span>
              </div>
            )}
          </div>

          <label htmlFor="phone">Phone:</label>
          <div className="field-wrapper">
            <input
              type="tel"
              id="phone"
              placeholder="e.g.03001234567"
              value={phone}
              onChange={handlePhoneChange}
              inputMode="numeric"
              maxLength={11}
              required
            />
            {phoneError && (
              <div className="field-popup">
                <span className="field-popup-icon">!</span>
                <span>{phoneError}</span>
              </div>
            )}
          </div>

          <label htmlFor="password">Password:</label>
          <div className="field-wrapper">
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="e.Home1234@"
                value={password}
                onChange={handlePasswordChange}
                required
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

          <label htmlFor="confirm-password">Confirm Password:</label>
          <div className="field-wrapper">
            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              {/*added popup for missing confirm password field*/}
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

          <div className="role-based-selector">
            <label htmlFor="role">Role:</label>
            <label className="radio-label">
              <input
                type="radio"
                name="role"
                value="customer"
                checked={role === "customer"}
                onChange={(e) => setRole(e.target.value)}
              />
              Customer
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={(e) => setRole(e.target.value)}
              />
              Admin
            </label>
          </div>

          <button type="submit">Sign up</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}