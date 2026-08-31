import { AdminNavbar } from "../../components/AdminNavbar";
import { Footer } from "../../components/Footer";
import { useState, useEffect } from "react";

export function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
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
          order._id === id ? { ...order, status: newStatus, autoManaged: false } : order
        )
      );
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  async function handleDelay(id, minutes) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}/delay`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ minutes }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delay order");
        return;
      }

      setOrders(orders.map((order) => (order._id === id ? data.order : order)));
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  const filteredOrders = orders
    .filter((order) =>
      order.customer?.name?.toLowerCase().includes(searchName.toLowerCase())
    )
    .filter((order) =>
      order._id.toLowerCase().includes(searchId.toLowerCase())
    )
    .filter((order) =>
      statusFilter === "All" ? true : order.status === statusFilter
    )
    .sort((a, b) => {
      if (sortBy === "price") return b.totalAmount - a.totalAmount;
      if (sortBy === "quantity") return b.items.length - a.items.length;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="page-wrapper">
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
            <div className="filters-bar">
              <input
                type="text"
                placeholder="Search by customer name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="filter-input"
              />

              <input
                type="text"
                placeholder="Search by Order ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="filter-input"
              />

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="quantity">Sort by Quantity</option>
              </select>
            </div>

            <div className="orders-table">
              {filteredOrders.map((order) => {
                const isActive = ["Pending", "Preparing", "Out for delivery"].includes(order.status);

                return (
                  <div className="admin-order-row" key={order._id}>
                    <div className="admin-order-info">
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <p>{order.customer?.name}</p>
                      <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>

                      {isActive && order.estimatedDeliveryTime && (
                        <p className="admin-order-eta">
                          ETA:{" "}
                          {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {!order.autoManaged && <span className="manual-tag"> · manual</span>}
                        </p>
                      )}

                      {order.prepTimeMinutes && (
                        <span className="admin-prep-time-badge">⏱ ~{order.prepTimeMinutes} min prep</span>
                      )}
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

                    {isActive && (
                      <div className="delay-actions">
                        <button type="button" className="delay-btn" onClick={() => handleDelay(order._id, 10)}>
                          +10 min
                        </button>
                        <button type="button" className="delay-btn" onClick={() => handleDelay(order._id, 20)}>
                          +20 min
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}