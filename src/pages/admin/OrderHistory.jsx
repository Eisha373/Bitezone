import { AdminNavbar } from "../../components/AdminNavbar";
import { Footer } from "../../components/Footer";
import { dummyAdminOrders } from "../../data/DummyAdminOrders";
import "../../admin.css";

export function OrderHistory() {
  const customerNames = [...new Set(dummyAdminOrders.map((order) => order.customerName))];

  return (
    <div>
      <AdminNavbar />

      <div className="admin-container">
        <h1>Customer Order History</h1>

        {customerNames.map((customer) => {
          const customerOrders = dummyAdminOrders.filter(
            (order) => order.customerName === customer
          );

          return (
            <div className="customer-history-block" key={customer}>
              <h2>{customer}</h2>
              {customerOrders.map((order) => (
                <div className="admin-order-row" key={order.id}>
                  <p>Order #{order.id}</p>
                  <p className="order-date">{order.date}</p>
                  <p>Rs {order.totalPrice}</p>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}