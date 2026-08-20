import { Navbar } from "./Navbar";
import { AdminNavbar } from "./AdminNavbar";

export function AppNavbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  return isAdmin ? <AdminNavbar /> : <Navbar />;
}