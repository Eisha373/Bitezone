import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppNavbar } from "../../components/AppNavbar";
import { Footer } from "../../components/Footer";
import "../../profile.css";

const PHONE_PATTERN = /^03\d{9}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export function Profile() {
  const navigate = useNavigate();
  const savedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [phone, setPhone] = useState(savedUser.phone || "");
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [message, setMessage] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleSavePhone() {
    setPhoneError("");
    if (!PHONE_PATTERN.test(phone)) {
      setPhoneError("Enter a valid 11-digit number e.g. 03001234567");
      return;
    }
    setSavingPhone(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPhoneError(data.message || "Failed to update phone");
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      setEditingPhone(false);
      setMessage("Phone number updated successfully");
    } catch {
      setPhoneError("Something went wrong. Please try again.");
    } finally {
      setSavingPhone(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Enter your current password");
      return;
    }
    if (!PASSWORD_PATTERN.test(newPassword)) {
      setPasswordError(
        "New password must be 8+ characters with uppercase, lowercase, number & special character"
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPasswordError(data.message || "Failed to change password");
        return;
      }
      setPasswordSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordForm(false);
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  }

  function handleLogoutClick() {
    navigate("/logout");
  }

  return (
    <div>
      <AppNavbar />
      <div className="profile-container">
        <h1>My Profile</h1>

        <div className="profile-card">
          <div className="profile-avatar">{savedUser.name?.[0]?.toUpperCase() || "U"}</div>
          {savedUser.role === "admin" && <span className="profile-admin-badge">Admin</span>}

          <div className="profile-field">
            <label>Full Name</label>
            <p>{savedUser.name}</p>
          </div>

          <div className="profile-field">
            <label>Email</label>
            <p>
              {savedUser.email} <span className="locked-badge">🔒 Cannot be changed</span>
            </p>
          </div>

          <div className="profile-field">
            <label>Phone</label>
            {editingPhone ? (
              <div className="profile-edit-row">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  maxLength={11}
                />
                <button className="profile-save-btn" onClick={handleSavePhone} disabled={savingPhone}>
                  {savingPhone ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => {
                    setEditingPhone(false);
                    setPhone(savedUser.phone || "");
                    setPhoneError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="profile-edit-row">
                <p>{savedUser.phone}</p>
                <button className="profile-edit-btn" onClick={() => setEditingPhone(true)}>
                  Edit
                </button>
              </div>
            )}
            {phoneError && <p className="profile-error">{phoneError}</p>}
          </div>

          <div className="profile-field">
            <label>Delivery Area</label>
            <p>{savedUser.area || "—"}</p>
          </div>

          <div className="profile-field">
            <label>Address</label>
            <p>{savedUser.address || "—"}</p>
          </div>
          <p className="profile-hint">Area & address can be updated anytime during checkout.</p>

          <hr />

          <div className="profile-field">
            <label>Password</label>
            {!showPasswordForm ? (
              <button className="profile-edit-btn" onClick={() => setShowPasswordForm(true)}>
                Change Password
              </button>
            ) : (
              <form className="password-form" onSubmit={handleChangePassword}>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                {passwordError && <p className="profile-error">{passwordError}</p>}
                <div className="password-form-actions">
                  <button type="submit" className="profile-save-btn" disabled={savingPassword}>
                    {savingPassword ? "Saving..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    className="profile-cancel-btn"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmNewPassword("");
                      setPasswordError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {passwordSuccess && <p className="profile-success">{passwordSuccess}</p>}
          {message && <p className="profile-success">{message}</p>}

          <button className="profile-logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}