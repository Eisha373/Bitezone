import {Link} from "react-router-dom"
export function Signup(){
    return(
<div className="auth-container">
            <div className="auth-card"> 
                <h2>Create Account</h2>
                <form>
                    <label htmlFor="full-name">Full Name:</label>
                    <input type="text" id="full-name"placeholder="e.g.Ali"required/>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" placeholder="e.g.ali123@example.com" required/>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" placeholder="Enter your password" required/>
                    <label htmlFor="confirm-password">Confirm Password:</label>
                    <input type="password" id="confirm-password" placeholder="Re-enter your password"required/>
                    <div className="role-based-selector">
                    <label htmlFor="role">Role:</label>
                    <select id="role" defaultValue="user">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    </div>
                    <button type="submit">Sign up</button>
                </form>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
}