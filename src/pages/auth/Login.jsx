import {Link} from "react-router-dom";
import "../../auth.css";

export function Login(){
    return(
        <div className="auth-container">
            <div className="auth-card">
         <img src="/images/logo.png" alt="Bitezone Logo" className="auth-logo" />
            <div className="auth-card">
            <h2>Welcome to Bitezone 🍔</h2>
            <form>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" placeholder="Email" required/>
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" placeholder="Password" required/>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
        </div>
        </div>
    );
}