import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppNavbar } from "../../components/AppNavbar";
import { Footer } from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { DELIVERY_ZONES } from "../../data/deliveryZones";
import "../../checkout.css";

export function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();

  const savedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [fullName, setFullName] = useState(savedUser.name || "");
  const [email, setEmail] = useState(savedUser.email || "");
  const [phone, setPhone] = useState(savedUser.phone || "");
  const [area, setArea] = useState(savedUser.area || "");
  const [address, setAddress] = useState(savedUser.address || "");

  const zone = DELIVERY_ZONES[area] || { charge: 0, driveMinutes: 0 };
  const deliveryCharge = zone.charge;
  const estimatedDriveMinutes = zone.driveMinutes;
  const finalTotal = totalPrice + deliveryCharge;

  const [areaError, setAreaError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [error, setError] = useState("");

  const [areaOpen, setAreaOpen] = useState(false);
  const areaRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (areaRef.current && !areaRef.current.contains(e.target)) {
        setAreaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");
    setAreaError("");
    setAddressError("");

    let hasError = false;
    if (!area) {
      setAreaError("Please select your delivery area");
      hasError = true;
    }
    if (!address) {
      setAddressError("Please enter your address");
      hasError = true;
    }

    if (hasError) return;

    try {
      const token = localStorage.getItem("token");

      const items = cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items, area, deliveryAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to place order");
        return;
      }

      clearCart();
      navigate("/my-orders");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="checkout-container">
      <AppNavbar />

      <div className="checkout-content">
        <div className="checkout-card">
          <h2>Delivery Details</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form onSubmit={handlePlaceOrder} noValidate autoComplete="on">
            <label htmlFor="full-name">Full Name:</label>
            <input
              type="text"
              id="full-name"
              name="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              required
            />
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <label htmlFor="phone">Phone No.:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone"
              required
            />

            <label htmlFor="area">Delivery Area:</label>
            <div className="field-wrapper">
              <div className="custom-select" ref={areaRef}>
                <button
                  type="button"
                  id="area"
                  className="custom-select-trigger"
                  onClick={() => setAreaOpen((o) => !o)}
                >
                  <span className={area ? "" : "placeholder"}>
                    {area || "Select your area"}
                  </span>
                  <span className="custom-select-arrow">▾</span>
                </button>
                {areaOpen && (
                  <ul className="custom-select-options">
                    {Object.keys(DELIVERY_ZONES).map((zoneName) => (
                      <li
                        key={zoneName}
                        className={zoneName === area ? "selected" : ""}
                        onClick={() => {
                          setArea(zoneName);
                          setAreaOpen(false);
                        }}
                      >
                        {zoneName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
                name="address"
                autoComplete="street-address"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              {addressError && (
                <div className="field-popup">
                  <span className="field-popup-icon">!</span>
                  <span>{addressError}</span>
                </div>
              )}
            </div>

            <button type="submit" className={isAdmin ? "admin-checkout" : "customer-checkout"}>
              Place Order
            </button>
          </form>
        </div>

        <div className={isAdmin ? "order-summary-admin" : "order-summary-card"}>
          <h2>Order Summary</h2>
          {cartItems.map((item) => (
            <div className="summary-item" key={item._id}>
              <span>{item.name} ({item.quantity})</span>
              <span>Rs {item.price * item.quantity}</span>
            </div>
          ))}
          <hr />
          <div className="summary-total">
            <span>Subtotal</span>
            <span>Rs {totalPrice}</span>
          </div>
          <div className="summary-total">
            <span>Delivery {area && `(${area})`}</span>
            <span>Rs {deliveryCharge}</span>
          </div>
          {area && (
            <p className="checkout-eta-hint">
              🕒 Estimated delivery in ~{estimatedDriveMinutes} min after preparation
            </p>
          )}
          <hr />
          <div className="summary-total">
            <span>Total</span>
            <span>Rs {finalTotal}</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}