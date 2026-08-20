import { AdminNavbar } from "../../components/AdminNavbar";
import { Footer } from "../../components/Footer";
import { useState, useEffect } from "react";
import "../../admin.css";

export function OrderHistory() {
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
          setError(data.message || "Failed to load order history");
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

  const customerNames = [...new Set(orders.map((order) => order.customer?.name))];

  return (
    <div>
      <AdminNavbar />

      <div className="admin-container">
        <h1>Customer Order History</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading ? (
          <div className="page-loader">
            <p>Loading...</p>
          </div>
        ) : (
          <>
        {customerNames.map((customer) => {
          const customerOrders = orders.filter(
            (order) => order.customer?.name === customer
          );

          return (
            <div className="customer-history-block" key={customer}>
              <h2>{customer}</h2>
              {customerOrders.map((order) => (
                <div className="admin-order-row" key={order._id}>
                  <p>Order #{order._id.slice(-6)}</p>
                  <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p>Rs {order.totalAmount}</p>
                  <span className={`status-badge status-${order.status.toLowerCase().replace(" ", "-")}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
            
          );
        })}
        </>
          )}
      </div>

      <Footer />
    </div>
  );
}