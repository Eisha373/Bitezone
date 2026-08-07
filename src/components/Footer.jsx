import {Link} from "react-router-dom";

export function Footer(){
    return(
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} BiteZone. All rights reserved.</p>
                <div className="footer-links">
                    <Link to="/contact">Contact Us</Link>
                    <a href="mailto:support@bitezone.com">support@bitezone.com</a>
                </div>
            </div>
        </footer>
    );
}