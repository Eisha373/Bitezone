import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppNavbar } from "../../components/AppNavbar";
import { Footer } from "../../components/Footer";
import socket from "../../utils/sockets";
import "../../order.css";

const STEPS = [
  { key: "Pending", label: "Confirming your order", icon: "📝" },
  { key: "Preparing", label: "Food is being prepared", icon: "👨‍🍳" },
    { key: "Out for delivery", label: "Courier is on the way", icon: "🛵" },
  { key: "Delivered", label: "Delivered — enjoy your meal!", icon: "🎉" },
];

function VerticalTracker({ order }) {
  const isCancelled = order.status === "Cancelled";
  const currentIndex = STEPS.findIndex((s) => s.key === order.status);

  function getTimeFor(key) {
    const entry = order.statusHistory?.find((h) => h.status === key);
    return entry
      ? new Date(entry.changedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : null;
  }

  if (isCancelled) {
    return (
      <div className="vt-cancelled">
        <span className="vt-cancelled-dot">✕</span>
        <div>
          <p className="vt-cancelled-title">Order Cancelled</p>
          <p className="vt-cancelled-sub">This order will not be delivered.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vt-timeline">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;

        return (
          <div key={step.key} className={`vt-row ${isFuture ? "vt-future" : ""}`}>
            <div className="vt-marker">
              <span className={`vt-dot ${isDone ? "vt-dot-done" : ""} ${isCurrent ? "vt-dot-current" : ""}`}>
                {isDone ? "✓" : ""}
              </span>
              {i < STEPS.length - 1 && <span className={`vt-line ${isDone ? "vt-line-done" : ""}`} />}
            </div>

            <div className="vt-content">
              <p className={`vt-label ${isCurrent ? "vt-label-current" : ""}`}>
                {step.icon} {step.label}
              </p>
              {isCurrent && (
                <>
                  <p className="vt-address">📍 {order.deliveryAddress}</p>
                </>
              )}
              {(isDone || isCurrent) && getTimeFor(step.key) && (
                <p className="vt-time">{getTimeFor(step.key)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    socket.emit("joinOrder", id);

    function handleUpdate(update) {
      setOrder((prev) => (prev ? { ...prev, ...update } : prev));
    }

    socket.on("orderUpdate", handleUpdate);

    return () => {
      socket.emit("leaveOrder", id);
      socket.off("orderUpdate", handleUpdate);
    };
  }, [id]);

  const displayId = order ? order.orderNumber || `BZ-${order._id.slice(-6).toUpperCase()}` : "";
const canCancel = order && order.status === "Pending";
  return (
    <div>
      <AppNavbar />
      <div className="orders-container">
        <h3>Order Tracking</h3>
        <span className="order-id-small">{displayId}</span>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading ? (
          <div className="page-loader">
            <p>Loading...</p>
          </div>
        ) : (
          order && (
            <div className="order-card tracking-card-v2">
              <div className="vt-header">
                <div>
                  <h3>Order {displayId}</h3>
                  <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`status-badge status-${order.status.toLowerCase().replace(" ", "-")}`}>
                  {order.status}
                </span>
              </div>

              <VerticalTracker order={order} />

              {canCancel && (
                <button className="vt-cancel-btn" type="button">
                  Cancel Order
                </button>
              )}

              <div className="order-items">
                {order.items.map((item) => (
                  <div className="summary-item" key={item.product._id}>
                    <span>
                      {item.product.name} ({item.quantity})
                    </span>
                    <span>Rs {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <p className="order-total">Total: Rs {order.totalAmount}</p>

              {order.status !== "Delivered" && order.status !== "Cancelled" && order.estimatedDeliveryTime && (
                <div className="vt-eta-banner">
                  <p className="vt-eta-time">
                    {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="vt-eta-label">ESTIMATED DELIVERY TIME</p>
                  <button className="vt-support-btn" type="button">
                    Contact Support
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  );
}