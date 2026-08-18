import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import "../../order.css";

function getEstimatedDelivery(createdAt) {
  const orderTime = new Date(createdAt);
  const estimatedTime = new Date(orderTime.getTime() + 45 * 60 * 1000); // +45 minutes
  return estimatedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load order");
          return;
        }

        setOrder(data);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  return (
    <div>
      <Navbar />

      <div className="orders-container">
        <h1>Order Tracking</h1>

        {loading && <p>Loading order...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {order && (
          <div className="order-card">
            <h3>Order #{order._id.slice(-6)}</h3>
            <span className={`status-badge status-${order.status.toLowerCase().replace(" ", "-")}`}>
              {order.status}
            </span>
            <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>

            <div className="order-items">
              {order.items.map((item) => (
                <div className="summary-item" key={item.product._id}>
                  <span>{item.product.name} ({item.quantity})</span>
                  <span>Rs {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <hr />
            <p className="order-total">Total: Rs {order.totalAmount}</p>
            <p className="delivery-address">Delivering to: {order.deliveryAddress}</p>
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
  <p className="estimated-delivery">
    Estimated delivery by: {getEstimatedDelivery(order.createdAt)}
  </p>
)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}