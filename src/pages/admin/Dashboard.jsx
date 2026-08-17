import { useState, useEffect } from "react";
import { AdminNavbar } from "../../components/AdminNavbar";
import { Footer } from "../../components/Footer";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/api/orders/stats/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load dashboard stats");
          return;
        }

        setStats(data);
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const kpiCards = stats
    ? [
        { label: "Total Orders", value: stats.totalOrders },
        { label: "Total Revenue", value: `Rs ${stats.totalRevenue}` },
        { label: "Pending Orders", value: stats.pendingOrders },
      ]
    : [];

  return (
    <div className="admin-container">
      <AdminNavbar />
      <h1>Dashboard</h1>

      {loading && <p>Loading stats...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="kpi-grid">
        {kpiCards.map((stat) => (
          <div className="kpi-card" key={stat.label}>
            <p className="kpi-label">{stat.label}</p>
            <h2 className="kpi-value">{stat.value}</h2>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}