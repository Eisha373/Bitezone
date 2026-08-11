import {Link} from "react-router-dom";

export function OrderCard({order}){
return(
    <div className="order-card">
      <div className="order-card-header">
        <h3>Order #{order.id}</h3>
        <span className={`status-badge status-${order.status.toLowerCase().replace(" ","-")}`}>
            {order.status}
        </span>
      </div>
      <p className="order-date">{order.date}</p>
      <p className="order-summary">{order.items.length} item(s)</p>
      <p className="order-total">{order.totalPrice}</p>
      <Link to={`/order-tracking/${order.id}`}>
        <button className="view-details-btn">View Details</button>
      </Link>
    </div>
);
}