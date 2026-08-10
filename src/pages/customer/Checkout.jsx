import {useState} from "react";
import {useNavigate} from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { dummyCart } from "../../data/DummyCart";
import "../../checkout.css";

export function Checkout(){
    const navigate=useNavigate();
    const[fullName,setFullName]=useState("");
    const[email,setEmail]=useState("");
    const[phone,setPhone]=useState("");
    const[address,setAddress]=useState("");

    const totalPrice = dummyCart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  function handlePlaceHolder(e){
    e.preventDefault();
    navigate("/my-orders");
  }

    return(
        <div className="checkout-container">
          <Navbar />
           
            <div className="checkout-content">
                <div className="checkout-card">
                    <h2>Delivery Details</h2>
                    <form onSubmit={handlePlaceHolder}>
                <label htmlFor="full-name">Full Name:</label>
                    <input type="text" id="full-name" value={fullName}onChange={(e)=>setFullName(e.target.value)}
                    placeholder="Enter your name"required/>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email}onChange={(e)=>setEmail(e.target.value)}
                    placeholder="Enter your email"required/>
                    <label htmlFor="phone">Phone No.:</label>
                    <input type="phone" id="phone" value={phone}onChange={(e)=>setPhone(e.target.value)}
                    placeholder="Enter your name"required/>
                    <label htmlFor="address">Address:</label>
                    <input type="address" id="address" value={address}onChange={(e)=>setAddress(e.target.value)}
                    placeholder="Enter your address"required/>
                     <button type="submit">Place Order</button>
                  </form>  
                </div>
                
                <div className="order-summary-card">
              <h2>Order Summary</h2>
              {dummyCart.map((item)=>(
            <div className="summary-item" key={item.id}>
                <span>{item.name} ({item.quantity})</span>
                <span>Rs {item.price * item.quantity}</span>
                </div>
            ))}
             <hr />
            <div className="summary-total">
              <span>Total</span>
              <span>Rs {totalPrice}</span>
              </div>
              </div>
             
              </div>
              

         <Footer/>
        </div>
    );
}