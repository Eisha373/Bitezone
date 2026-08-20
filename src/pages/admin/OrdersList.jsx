import { AdminNavbar } from "../../components/AdminNavbar";
import { Footer } from "../../components/Footer";
import { useState, useEffect } from "react";

export function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load orders");
          return;
        }

        setOrders(data);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  async function handleStatusChange(id, newStatus) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update status");
        return;
      }

      setOrders(
        orders.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <AdminNavbar />
      <div className="admin-container">
        <h1>Orders List</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}
{loading ? (
          <div className="page-loader">
            <p>Loading...</p>
          </div>
        ) : (
          <>
        <div className="orders-table">
          {orders.map((order) => (
            <div className="admin-order-row" key={order._id}>
              <div className="admin-order-info">
                <h3>Order #{order._id.slice(-6)}</h3>
                <p>{order.customer?.name}</p>
                <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="admin-order-items">{order.items.length} item(s)</p>
              <p className="admin-order-total">Rs {order.totalAmount}</p>
              <select
                className="status-select"
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </div>
        </>
        )}
      </div>
      <Footer />
    </div>
  );
}