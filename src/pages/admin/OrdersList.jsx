import {dummyAdminOrders} from "../../data/DummyAdminOrders";
import {AdminNavbar} from "../../components/AdminNavbar";
import {Footer} from "../../components/Footer";
import {useState} from "react";

export function OrdersList(){
    const[orders,setOrders]=useState(dummyAdminOrders);

    function handleStatusChange(id,newStatus){
        setOrders(
            orders.map((order)=>
            order.id===id? {...order, status:newStatus}:order)
        );

    }
    return(
        <div>
          <AdminNavbar /> 
          <div className="admin-container">
            <h1>Orders List</h1>
            <div className="orders-table">
          {orders.map((order)=>(
            <div className="admin-order-row"key={order.id}>
                <div className="admin-order-info">
                    <h3>Order #{order.id}</h3>
                    <p>{order.customerName}</p>
                    <p className="order-date">Date {order.date}</p>
                    </div>
                    <p className="admin-order-items">{order.items.length} item(s)</p>
              <p className="admin-order-total">Rs {order.totalPrice}</p>
              <select className="status-select"value={order.status}
              onChange={
                (e)=> handleStatusChange(order.id,e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Delivered">Delivered</option>
                <option value="Preparing">Preparing</option>
                <option value="Cancelled">Cancelled</option>
              </select>
                </div>
          ))}
          </div>
          </div>
          <Footer/>
        </div>
    );
}