import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";

// Admin pages
import AdminPanel from "./pages/Admin/AdminPanel";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageTeams from "./pages/Admin/ManageTeams";
import ManagePlayers from "./pages/Admin/ManagePlayers";
import ManageMatches from "./pages/Admin/ManageMatches";

// User pages
import UserDashboard from "./pages/User/UserDashboard";
import ViewTeams from "./pages/User/ViewTeams";
import ViewPlayers from "./pages/User/ViewPlayers";
import ViewLeagues from "./pages/User/ViewLeagues";
import ViewMatches from "./pages/User/ViewMatches";
import Search from "./pages/User/Search";

import DashboardLayout from "./components/DashboardLayout";

// Sidebar links
const adminLinks = [
  { name: "Manage Users", path: "/admin/manage-users" },
  { name: "Manage Teams", path: "/admin/manage-teams" },
  { name: "Manage Players", path: "/admin/manage-players" },
  { name: "Manage Matches", path: "/admin/manage-matches" },
];

const userLinks = [
  { name: "Teams", path: "/dashboard/teams" },
  { name: "Players", path: "/dashboard/players" },
  { name: "Leagues", path: "/dashboard/leagues" },
  { name: "Matches", path: "/dashboard/matches" },
  { name: "Search", path: "/dashboard/search" },
];

export default function App() {
  const [apiStatus, setApiStatus] = useState("checking");

  // Check API connection on mount
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        );
        if (response.ok) {
          setApiStatus("connected");
        } else {
          setApiStatus("error");
        }
      } catch (error) {
        console.error("API connection error:", error);
        setApiStatus("error");
      }
    };

    checkAPI();
  }, []);

  return (
    <Router>
      {/* Optional: Show API status banner */}
      {apiStatus === "error" && (
        <div
          style={{
            background: "#fee",
            padding: "10px",
            textAlign: "center",
            borderBottom: "2px solid #fcc",
          }}
        >
          ⚠️ Backend API is not responding. Please start the Flask server.
        </div>
      )}

      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={<DashboardLayout links={adminLinks} title="Admin Panel" />}
        >
          <Route index element={<AdminPanel />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-teams" element={<ManageTeams />} />
          <Route path="manage-players" element={<ManagePlayers />} />
          <Route path="manage-matches" element={<ManageMatches />} />
        </Route>

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={<DashboardLayout links={userLinks} title="User Dashboard" />}
        >
          <Route index element={<UserDashboard />} />
          <Route path="teams" element={<ViewTeams />} />
          <Route path="players" element={<ViewPlayers />} />
          <Route path="leagues" element={<ViewLeagues />} />
          <Route path="matches" element={<ViewMatches />} />
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </Router>
  );
}
