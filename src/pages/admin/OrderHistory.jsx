import { AdminNavbar } from "../../components/AdminNavbar";
import { Footer } from "../../components/Footer";
import { useState, useEffect } from "react";
import "../../admin.css";

export function OrderHistory() {
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
    return new Date(b.createdAt) - new Date(a.createdAt); // default: date
  });


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
        {customerNames.map((customer) => {
          const customerOrders = filteredOrders.filter(
            (order) => order.customer?.name === customer
          );

          return (
            <div className="customer-history-block" key={customer}>
              <h2>{customer}</h2>
              {customerOrders.map((order) => (
            <div className={`admin-order-row ${order.status.toLowerCase().replace(/\s+/g, "-")}`}
                key={order._id}
>                  <p>Order #{order._id.slice(-6)}</p>
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