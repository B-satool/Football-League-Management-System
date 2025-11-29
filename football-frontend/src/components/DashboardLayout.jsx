import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ links, title }) {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar stays visible */}
      <Sidebar links={links} title={title} />

      {/* Main content changes */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}
