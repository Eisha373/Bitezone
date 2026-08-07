import {BrowserRouter,Routes,Route} from "react-router-dom";
import {Login} from"./pages/auth/Login";
import {Signup} from"./pages/auth/Signup";
import {Logout} from"./pages/auth/Logout";
import "./auth.css";

function App()
{
  return(

<BrowserRouter>
<Routes>
  <Route path="/login" element={<Login/>}/>
  <Route path="/signup" element={<Signup/>}/>
  <Route path="/logout" element={<Logout/>}/>
  
  </Routes>
  </BrowserRouter>
  );
}
  export default App;