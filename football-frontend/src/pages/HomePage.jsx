// src/css/HomePage.jsx
import { Link } from "react-router-dom";
import "../css/HomePage.css";

export default function HomePage() {
  return (
    <div className="home-container">
      <h1>Welcome to Football League Management System</h1>
      <p>Choose your dashboard to continue:</p>

      <div className="button-group">
        <Link to="/admin">
          <button className="home-btn">Admin Dashboard</button>
        </Link>

        <Link to="/dashboard">
          <button className="home-btn">User Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
