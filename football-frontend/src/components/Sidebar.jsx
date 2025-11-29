import { Link } from "react-router-dom";

export default function Sidebar({ links, title }) {
  // `links` is an array of objects: { name: "Manage Users", path: "/admin/manage-users" }
  return (
    <div style={{
      width: "250px",
      background: "#8b8b8bff",
      padding: "20px",
      height: "100vh"
    }}>
      <h2>{title}</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {links.map((link) => (
          <li key={link.path} style={{ margin: "10px 0" }}>
            <Link to={link.path} style={{ textDecoration: "none", color: "#333" }}>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
