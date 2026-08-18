import { Link } from "react-router-dom";

export function OrderCard({ order }) {
  return (
    <div className="order-card">
      <div className="order-card-header">
        <h3>Order #{order._id.slice(-6)}</h3>
        <span className={`status-badge status-${order.status.toLowerCase().replace(" ", "-")}`}>
          {order.status}
        </span>
      </div>
      <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
      <p className="order-summary">{order.items.length} item(s)</p>
      <p className="order-total">Rs {order.totalAmount}</p>
      <Link to={`/order-tracking/${order._id}`}>
        <button className="view-details-btn">View Details</button>
      </Link>
    </div>
  );
}