import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import "../../checkout.css";

export function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");

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
        body: JSON.stringify({ items, deliveryAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to place order");
        return;
      }

      clearCart();
      navigate("/my-orders");
    } 
    catch{
  setError("Something went wrong. Please try again.");
}
  }

  return (
    <div className="checkout-container">
      <Navbar />

      <div className="checkout-content">
        <div className="checkout-card">
          <h2>Delivery Details</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form onSubmit={handlePlaceOrder}>
            <label htmlFor="full-name">Full Name:</label>
            <input type="text" id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name" required />
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" required />
            <label htmlFor="phone">Phone No.:</label>
            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone" required />
            <label htmlFor="address">Address:</label>
            <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address" required />
            <button type="submit">Place Order</button>
          </form>
        </div>

        <div className="order-summary-card">
          <h2>Order Summary</h2>
          {cartItems.map((item) => (
            <div className="summary-item" key={item._id}>
              <span>{item.name} ({item.quantity})</span>
              <span>Rs {item.price * item.quantity}</span>
            </div>
          ))}
          <hr />
          <div className="summary-total">
            <span>Total</span>
            <span>Rs {totalPrice}</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}