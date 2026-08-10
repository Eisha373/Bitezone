import {Link,useNavigate} from "react-router-dom";
import "../navbar-footer.css";
export function Navbar() {

    const navigate = useNavigate();
    function handleLogoutClick(){
            navigate("/login");
        }
    return(
        <nav className="navbar">
            <div className="navbar-logo">
        <Link to="/">Bitezone 🍔</Link>
      </div>
      <ul className="navbar-links">
           <li> <Link to="/">Menu</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/my-orders">My Orders</Link></li>
            <li>
                <button className="logout-button" onClick={handleLogoutClick}> Logout</button>
            </li>
            </ul>
        </nav>
    );
}