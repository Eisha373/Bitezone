import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppNavbar } from "../../components/AppNavbar";
import { Footer } from "../../components/Footer";
import socket from "../../utils/socket";       // added
import "../../order.css";

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

  // added: join the order's socket room and listen for live updates
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

  return (
    <div>
      <AppNavbar />
      <div className="orders-container">
        <h1>Order Tracking</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading ? (
          <div className="page-loader"><p>Loading...</p></div>
        ) : (
          <>
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

                {order.status !== "Delivered" && order.status !== "Cancelled" && order.estimatedDeliveryTime && (
                  <p className="estimated-delivery">
                    Estimated delivery by:{" "}
                    {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}

                {/* added: live status timeline */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="status-timeline">
                    {order.statusHistory.map((entry, i) => (
                      <div className="timeline-entry" key={i}>
                        <span className="timeline-status">{entry.status}</span>
                        <span className="timeline-time">
                          {new Date(entry.changedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}