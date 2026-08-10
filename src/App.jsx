import {BrowserRouter,Routes,Route} from "react-router-dom";
import {Login} from"./pages/auth/Login";
import {Signup} from"./pages/auth/Signup";
import {Logout} from"./pages/auth/Logout";
import {Home} from "./pages/customer/Home";
import {Cart} from "./pages/customer/Cart";
import "./auth.css";
import "./home.css";
import "./navbar-footer.css";
import "./cart.css";

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
  </Routes>
  </BrowserRouter>
  );
}
  export default App;