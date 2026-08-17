import { useState, useEffect } from "react";
import { OrderCard } from "../../components/OrderCard";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import "../../order.css";

export function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/api/orders/my", {
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

  const hasOrders = orders.length > 0;

  return (
    <div>
      <Navbar />

      <div className="orders-container">
        <h1>My Orders</h1>

        {loading && <p>Loading orders...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {hasOrders ? (
          <div className="orders-list">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          !loading && <p className="empty-state">You haven't placed any orders yet.</p>
        )}
      </div>

      <Footer />
    </div>
  );
}