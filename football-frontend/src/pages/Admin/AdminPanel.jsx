import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function AdminPanel() {
  const adminLinks = [
    { name: "Manage Users", path: "/admin/manage-users" },
    { name: "Manage Teams", path: "/admin/manage-teams" },
    { name: "Manage Players", path: "/admin/manage-players" },
    { name: "Manage Matches", path: "/admin/manage-matches" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <div style={{ padding: "20px", flex: 1 }}>
        <h1>Welcome to Admin Dashboard</h1>
        <p>Select an option from the sidebar.</p>
      </div>
    </div>
  );
}
