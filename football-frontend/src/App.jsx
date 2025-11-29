import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
  { name: "Teams", path: "/teams" },
  { name: "Players", path: "/players" },
  { name: "Leagues", path: "/leagues" },
  { name: "Matches", path: "/matches" },
  { name: "Search", path: "/search" },
];

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<DashboardLayout links={adminLinks} title="Admin Panel" />}>
          <Route index element={<AdminPanel />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-teams" element={<ManageTeams />} />
          <Route path="manage-players" element={<ManagePlayers />} />
          <Route path="manage-matches" element={<ManageMatches />} />
        </Route>

        {/* User Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout links={userLinks} title="User Dashboard" />}>
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
