// src/pages/HomePage.jsx
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",  
      textAlign: "center",
      background: "#8b8b8bff"
    }}>
      <h1>Welcome to Football League Management System</h1>
      <p>Choose your dashboard to continue:</p>
      
      <div style={{ marginTop: "30px" }}>
        <Link to="/admin">
          <button style={{
            padding: "10px 20px",
            marginRight: "20px",
            fontSize: "16px",
            cursor: "pointer",
            background: "#333"
          }}>
            Admin Dashboard
          </button>
        </Link>

        <Link to="/dashboard">
          <button style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            background: "#333"
          }}>
            User Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
