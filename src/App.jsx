import {BrowserRouter,Routes,Route} from "react-router-dom";
import {Login} from"./pages/auth/Login";
import {Signup} from"./pages/auth/Signup";
import {Logout} from"./pages/auth/Logout";
import {Home} from "./pages/customer/Home";
import {Cart} from "./pages/customer/Cart";
import {Checkout} from "./pages/customer/Checkout";
import { MyOrders } from "./pages/customer/MyOrders";
import {Dashboard} from "./pages/admin/Dashboard";
import "./auth.css";
import "./home.css";
import "./navbar-footer.css";
import "./cart.css";
import "./checkout.css";
import "./order.css";
import "./admin-navbar.css";
import "./admin-dashboard.css";


function App()
{
  return(

<BrowserRouter>
<Routes>
  <Route path="/" element={<Home/>}/>
  <Route path="/login" element={<Login/>}/>
  <Route path="/signup" element={<Signup/>}/>
  <Route path="/logout" element={<Logout/>}/>
  <Route path="/cart" element={<Cart/>}/>
  <Route path="/checkout"element={<Checkout/>}/>
  <Route path="/my-orders" element={<MyOrders />} />
  <Route path="/dashboard" element={<Dashboard/>}/>
  </Routes>
  </BrowserRouter>
  );
}
  export default App;