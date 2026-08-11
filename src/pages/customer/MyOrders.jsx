import {OrderCard} from "../../components/OrderCard";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import {dummyOrders} from "../../data/DummyOrders";
import "../../order.css";

export function MyOrders() {
  const hasOrders = dummyOrders.length > 0;

  return (
    <div>
      <Navbar />

      <div className="orders-container">
        <h1>My Orders</h1>

        {hasOrders ? (
          <div className="orders-list">
            {dummyOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <p className="empty-state">You haven't placed any orders yet.</p>
        )}
      </div>

      <Footer />
    </div>
  );
}