import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AdminNavbar } from "../../components/AdminNavbar";
import { Footer } from "../../components/Footer";
import { useToast } from "../../context/ToastContext";
import { DELIVERY_ZONES } from "../../data/deliveryZones";
import "../../admin.css";

const NAME_PATTERN = /^[A-Za-z\s]{3,50}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^03\d{9}$/;

const PASSWORD_RULES = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
  { label: "Special character", test: (p) => /[\W_]/.test(p) },
];

const EMPTY = {
  name: "", email: "", phone: "", area: "", address: "", password: "", confirmPassword: "",
};

function validate(f) {
  const e = {};
  if (!NAME_PATTERN.test(f.name)) e.name = "Enter a valid name (letters only)";
  if (!EMAIL_PATTERN.test(f.email)) e.email = "Enter a valid email address";
  if (!PHONE_PATTERN.test(f.phone)) e.phone = "Enter an 11-digit number e.g. 03001234567";
  if (!f.area) e.area = "Please select a delivery area";
  if (!f.address.trim()) e.address = "Please enter an address";
  if (!PASSWORD_RULES.every((r) => r.test(f.password))) e.password = "Password does not meet all requirements";
  if (!f.confirmPassword) e.confirmPassword = "Please re-enter the password";
  else if (f.confirmPassword !== f.password) e.confirmPassword = "Passwords do not match";
  return e;
}

export function CreateAdmin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);
  const areaRef = useRef(null);

  const [slots, setSlots] = useState({ count: 0, max: 3, loaded: false });

  useEffect(() => {
    function handleClickOutside(e) {
      if (areaRef.current && !areaRef.current.contains(e.target)) setAreaOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadSlots() {
      try {
        const res = await fetch(`${API}/api/auth/admins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setSlots({ count: data.admins.length, max: data.maxAdmins, loaded: true });
      } catch {
        // backend phir bhi limit enforce karega
      }
    }
    loadSlots();
  }, [API, token]);

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;
  const limitReached = slots.loaded && slots.count >= slots.max;

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }
  function touch(name) {
    setTouched((t) => ({ ...t, [name]: true }));
  }
  function handleChange(e) {
    const { name, value } = e.target;
    setField(name, name === "phone" ? value.replace(/\D/g, "").slice(0, 11) : value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      name: true, email: true, phone: true, area: true,
      address: true, password: true, confirmPassword: true,
    });
    if (!isValid || limitReached) return;

    setSubmitting(true);
    try {
      const { name, email, phone, area, address, password } = form;
      const res = await fetch(`${API}/api/auth/create-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, phone, area, address, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to create admin", "error");
        return;
      }
      showToast(`${data.admin.name} has been added as a new admin`, "success");
      navigate("/admin/admins");
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function FieldError({ name }) {
    return touched[name] && errors[name] ? (
      <div className="field-popup">
        <span className="field-popup-icon">!</span>
        <span>{errors[name]}</span>
      </div>
    ) : null;
  }

  return (
    <div className="page-wrapper">
      <AdminNavbar />

      <div className="admin-container">
        <div className="ca-wrap">
          <div className="ma-header">
            <h1>Create New Admin</h1>
            <Link to="/admin/admins" className="ma-link-btn">← Back to admins</Link>
          </div>

          {slots.loaded && (
            <div className={`ma-slots ${limitReached ? "ma-slots-full" : ""}`}>
              <div className="ma-slots-text">
                {slots.count} of {slots.max} admin slots used
                {limitReached && " — limit reached"}
              </div>
              <div className="ma-slots-bar">
                <span style={{ width: `${Math.min(100, (slots.count / slots.max) * 100)}%` }} />
              </div>
            </div>
          )}

          <div className="manage-admins-card ca-card">
            <form onSubmit={handleSubmit} noValidate autoComplete="off">
              <fieldset disabled={limitReached || submitting} className="ca-fieldset">
                <label htmlFor="ca-name">Full Name:</label>
                <div className="field-wrapper">
                  <input id="ca-name" name="name" type="text" placeholder="e.g. Ali Raza"
                    value={form.name} onChange={handleChange} onBlur={() => touch("name")} />
                  <FieldError name="name" />
                </div>

                <label htmlFor="ca-email">Email:</label>
                <div className="field-wrapper">
                  <input id="ca-email" name="email" type="email" placeholder="e.g. ali123@example.com"
                    value={form.email} onChange={handleChange} onBlur={() => touch("email")} />
                  <FieldError name="email" />
                </div>

                <label htmlFor="ca-phone">Phone:</label>
                <div className="field-wrapper">
                  <input id="ca-phone" name="phone" type="tel" inputMode="numeric" maxLength={11}
                    placeholder="e.g. 03001234567"
                    value={form.phone} onChange={handleChange} onBlur={() => touch("phone")} />
                  <FieldError name="phone" />
                </div>

                <label htmlFor="ca-area">Delivery Area:</label>
                <div className="field-wrapper">
                  <div className="custom-select" ref={areaRef}>
                    <button type="button" id="ca-area" className="custom-select-trigger"
                      onClick={() => { setAreaOpen((o) => !o); touch("area"); }}>
                      <span className={form.area ? "" : "placeholder"}>
                        {form.area || "Select delivery area"}
                      </span>
                      <span className="custom-select-arrow">▾</span>
                    </button>
                    {areaOpen && (
                      <ul className="custom-select-options">
                        {Object.keys(DELIVERY_ZONES).map((zone) => (
                          <li key={zone} className={zone === form.area ? "selected" : ""}
                            onClick={() => { setField("area", zone); setAreaOpen(false); }}>
                            {zone}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <FieldError name="area" />
                </div>

                <label htmlFor="ca-address">Address:</label>
                <div className="field-wrapper">
                  <input id="ca-address" name="address" type="text"
                    placeholder="e.g. House #23, street abc, DHA phase 5"
                    value={form.address} onChange={handleChange} onBlur={() => touch("address")} />
                  <FieldError name="address" />
                </div>

                <label htmlFor="ca-password">Password:</label>
                <div className="field-wrapper">
                  <div className="password-field">
                    <input id="ca-password" name="password" autoComplete="new-password"
                      type={showPassword ? "text" : "password"}
                      value={form.password} onChange={handleChange} onBlur={() => touch("password")} />
                    <button type="button" className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <ul className="ca-rules">
                    {PASSWORD_RULES.map((r) => (
                      <li key={r.label} className={r.test(form.password) ? "ca-rule-ok" : ""}>
                        {r.test(form.password) ? "✓" : "○"} {r.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <label htmlFor="ca-confirm">Confirm Password:</label>
                <div className="field-wrapper">
                  <div className="password-field">
                    <input id="ca-confirm" name="confirmPassword" autoComplete="new-password"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword} onChange={handleChange}
                      onBlur={() => touch("confirmPassword")} />
                    <button type="button" className="toggle-password-btn"
                      onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <FieldError name="confirmPassword" />
                </div>
              </fieldset>

              <button type="submit" className="manage-admins-btn"
                disabled={!isValid || submitting || limitReached}>
                {limitReached ? "Admin limit reached" : submitting ? "Creating..." : "Create Admin"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}