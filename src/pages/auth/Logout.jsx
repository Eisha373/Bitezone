import {useNavigate} from "react-router-dom";
import { useCart } from "../../context/CartContext";

import "../../auth.css";

export function Logout(){

    const navigate = useNavigate();
  const { clearCart } = useCart();

    function handleConfirmLogout(){
localStorage.removeItem("token");
    localStorage.removeItem("user");
        clearCart();
      navigate("/login");
    }
    function handleCancelLogout(){
        navigate(-1);
    }
    return(
        <div className="auth-container">
            <div className="auth-card">
            <p>Are you sure you want to logout?</p>
            <div className="logout-actions">
            <button onClick={handleCancelLogout}>Cancel</button>
            <button onClick={handleConfirmLogout}>Confirm</button>
        </div>
        </div>
        </div>

    );
}