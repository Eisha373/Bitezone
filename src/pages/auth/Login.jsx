import {Link} from "react-router-dom";
import "../../auth.css";

export function Login(){
    return(
        <div className="auth-container">
            <div className="auth-card">
         <img src="/images/burger-logo(1).jpg" alt="Bitezone Logo" className="auth-logo" />
            
            <h2>Welcome to Bitezone</h2>
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
        
    );
}