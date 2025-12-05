import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/Sidebar.css";

export default function Sidebar({ links, title }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect whether we are in the admin or user dashboard
  const isAdmin = location.pathname.startsWith("/admin");
  const isUser = location.pathname.startsWith("/dashboard");

  const handleSwitch = () => {
    if (isAdmin) {
      navigate("/dashboard");
    } else if (isUser) {
      navigate("/admin");
    }
  };

  return (
    <div className="sidebar-container">
      <h2 className="sidebar-title">{title}</h2>

      <ul className="sidebar-list">
        {links.map((link) => (
          <li key={link.path} className="sidebar-item">
            <Link to={link.path} className="sidebar-link">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>

      {(isAdmin || isUser) && (
        <button className="switch-btn" onClick={handleSwitch}>
          {isAdmin ? "Go to User Dashboard" : "Go to Admin Dashboard"}
        </button>
      )}
    </div>
  );
}
