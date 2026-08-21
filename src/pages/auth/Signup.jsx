import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { DELIVERY_ZONES } from "../../data/deliveryZones";
import "../../auth.css";

const NAME_PATTERN = /^[A-Za-z\s]{3,50}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^03\d{9}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [areaError, setAreaError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleNameChange(e) {
    setName(e.target.value);
  }
  function handleEmailChange(e) {
    setEmail(e.target.value);
  }
  function handlePhoneChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(value);
  }
  function handleAreaChange(e) {
    setArea(e.target.value);
  }
  function handleAddressChange(e) {
    setAddress(e.target.value);
  }
  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }
  function handleConfirmPasswordChange(e) {
    setConfirmPassword(e.target.value);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setAreaError("");
    setAddressError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    if (!NAME_PATTERN.test(name)) {
      setNameError("Enter a valid name (letters only)");
      hasError = true;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setEmailError("Enter a valid email address, e.g. ali123@example.com");
      hasError = true;
    }
    if (!PHONE_PATTERN.test(phone)) {
      setPhoneError("Enter an 11-digit number e.g. 03001234567");
      hasError = true;
    }
    if (!area) {
      setAreaError("Please select your delivery area");
      hasError = true;
    }
    if (!address.trim()) {
      setAddressError("Please enter your address");
      hasError = true;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      setPasswordError(
        "Must be 8+ characters with uppercase, lowercase, number & special character"
      );
      hasError = true;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Please re-enter your password");
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, area, address, password, role }),
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

          <label htmlFor="area">Delivery Area:</label>
          <div className="field-wrapper">
            <select id="area" value={area} onChange={handleAreaChange} required>
              <option value="">Select your area</option>
              {Object.keys(DELIVERY_ZONES).map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            {areaError && (
              <div className="field-popup">
                <span className="field-popup-icon">!</span>
                <span>{areaError}</span>
              </div>
            )}
          </div>

          <label htmlFor="address">Address:</label>
          <div className="field-wrapper">
            <input
              type="text"
              id="address"
              placeholder="House #, street, landmark"
              value={address}
              onChange={handleAddressChange}
              required
            />
            {addressError && (
              <div className="field-popup">
                <span className="field-popup-icon">!</span>
                <span>{addressError}</span>
              </div>
            )}
          </div>

          <label htmlFor="password">Password:</label>
          <div className="field-wrapper">
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="e.g,.Home1234@"
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