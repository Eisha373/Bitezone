import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminNavbar } from "../../components/AdminNavbar";
import { Footer } from "../../components/Footer";
import { useToast } from "../../context/ToastContext";
import "../../admin.css";

export function ManageAdmins() {
  const { showToast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_URL;

  const [admins, setAdmins] = useState([]);
  const [maxAdmins, setMaxAdmins] = useState(3);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  async function fetchAdmins() {
    try {
      const res = await fetch(`${API}/api/auth/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to load admins", "error");
        return;
      }
      setAdmins(data.admins);
      setMaxAdmins(data.maxAdmins);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmRemove() {
    setRemoving(true);
    try {
      const res = await fetch(`${API}/api/auth/admins/${target._id}/demote`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to update admin", "error");
      } else {
        showToast(`${target.name} is no longer an admin`, "info");
        fetchAdmins();
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setRemoving(false);
      setTarget(null);
    }
  }

  const filtered = admins.filter((a) =>
    `${a.name} ${a.email}`.toLowerCase().includes(search.trim().toLowerCase())
  );
  const limitReached = admins.length >= maxAdmins;

  return (
    <div className="page-wrapper">
      <AdminNavbar />

      <div className="admin-container">
        <div className="ma-header">
          <h1>Manage Admins</h1>
          {limitReached ? (
            <span className="ma-link-btn ma-link-disabled">Admin limit reached</span>
          ) : (
            <Link to="/admin/admins/create" className="ma-link-btn ma-link-primary">
              + Create New Admin
            </Link>
          )}
        </div>

        {!loading && (
          <div className={`ma-slots ${limitReached ? "ma-slots-full" : ""}`}>
            <div className="ma-slots-text">{admins.length} of {maxAdmins} admin slots used</div>
            <div className="ma-slots-bar">
              <span style={{ width: `${Math.min(100, (admins.length / maxAdmins) * 100)}%` }} />
            </div>
          </div>
        )}

        <div className="manage-admins-card">
          <input
            type="search"
            className="ma-search"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <div className="manage-admins-list">
              {[1, 2, 3].map((i) => <div key={i} className="ma-skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="ma-empty">
              <div className="ma-empty-icon">🔍</div>
              <p>No admins match "{search}"</p>
            </div>
          ) : (
            <div className="manage-admins-list">
              {filtered.map((admin) => {
                const isSelf = admin._id === currentUser.id;
                return (
                  <div className="manage-admins-row" key={admin._id}>
                    <div className="ma-avatar">{admin.name.charAt(0).toUpperCase()}</div>
                    <div className="ma-info">
                      <p className="manage-admins-name">
                        {admin.name}
                        {isSelf && <span className="manage-admins-you">You</span>}
                        <span className={`ma-badge ${admin.isOwner ? "ma-badge-owner" : ""}`}>
                          {admin.isOwner ? "Owner" : "Admin"}
                        </span>
                      </p>
                      <p className="manage-admins-meta">{admin.email}</p>
                      <p className="manage-admins-meta">
                        {admin.createdBy ? `Added by ${admin.createdBy.name}` : "Original admin"}
                        {" · "}
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!isSelf && !admin.isOwner && (
                      <button type="button" className="manage-admins-remove"
                        onClick={() => setTarget(admin)}>
                        Remove access
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {target && (
        <div className="ma-modal-overlay" onClick={() => !removing && setTarget(null)}>
          <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Remove admin access?</h3>
            <p>
              <strong>{target.name}</strong> ({target.email}) will become a regular customer
              and lose access to the admin panel. This frees up one admin slot.
            </p>
            <div className="ma-modal-actions">
              <button type="button" className="ma-btn-cancel"
                onClick={() => setTarget(null)} disabled={removing}>
                Cancel
              </button>
              <button type="button" className="ma-btn-danger"
                onClick={confirmRemove} disabled={removing}>
                {removing ? "Removing..." : "Remove access"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}