import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "white" }}>
      <Link to="/admin" style={{ marginRight: "20px", color: "white" }}>
        Admin Panel
      </Link>
      <Link to="/teams" style={{ color: "white" }}>
        User Dashboard
      </Link>
    </nav>
  );
}
