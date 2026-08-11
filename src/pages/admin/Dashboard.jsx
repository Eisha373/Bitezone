import {dummyStats} from "../../data/DummyStats";
import { AdminNavbar } from "../../components/AdminNavbar";
import {Footer} from "../../components/Footer";


export function AdminDashboard() {
  return (
    <div className="admin-container">
        <AdminNavbar/>
      <h1>Dashboard</h1>
      <div className="kpi-grid">
        {dummyStats.map((stat) => (
          <div className="kpi-card" key={stat.label}>
            <p className="kpi-label">{stat.label}</p>
            <h2 className="kpi-value">{stat.value}</h2>
            <p className="kpi-trend">{stat.trend}</p>
          </div>
        ))}
      </div>
      
      <Footer/>
    </div>
  );
}