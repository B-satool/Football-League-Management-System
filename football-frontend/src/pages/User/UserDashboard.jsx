import Sidebar from "../../components/Sidebar";

export default function UserDashboard() {
  const userLinks = [
    { name: "Teams", path: "/teams" },
    { name: "Players", path: "/players" },
    { name: "Leagues", path: "/leagues" },
    { name: "Matches", path: "/matches" },
    { name: "Search", path: "/search" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <div style={{ padding: "20px", flex: 1 }}>
        <h1>Welcome to User Dashboard</h1>
        <p>Select an option from the sidebar.</p>
      </div>
    </div>
  );
}
