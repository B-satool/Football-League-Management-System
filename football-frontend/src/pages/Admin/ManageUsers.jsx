import { useState, useEffect } from "react";
import { adminService } from "../../services/admin.service";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'audit'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("all"); // 'all', 'admin', 'user'

  useEffect(() => {
    loadUsers();
    loadAuditLog();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Error loading users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLog = async () => {
    try {
      const data = await adminService.getAuditLog();
      setAuditLogs(data.audit_logs || []);
    } catch (error) {
      console.error("Error loading audit log:", error);
    }
  };

  const handlePrivilegeChange = async (userId, currentAdminStatus) => {
    const newStatus = !currentAdminStatus;
    const action = newStatus
      ? "grant admin privileges to"
      : "revoke admin privileges from";

    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      await adminService.updateUserPrivilege(userId, newStatus);
      alert(`User privileges updated successfully!`);
      loadUsers();
      loadAuditLog(); // Refresh audit log
    } catch (error) {
      alert("Error updating user privilege: " + error.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterAdmin === "all" ||
      (filterAdmin === "admin" && user.is_admin === 1) ||
      (filterAdmin === "user" && user.is_admin === 0);

    return matchesSearch && matchesFilter;
  });

  const getUserBadge = (isAdmin) => {
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "bold",
          backgroundColor: isAdmin ? "#10b981" : "#6b7280",
          color: "white",
        }}
      >
        {isAdmin ? "ADMIN" : "USER"}
      </span>
    );
  };

  const getActionBadge = (oldStatus, newStatus) => {
    if (oldStatus === 0 && newStatus === 1) {
      return (
        <span style={{ color: "#10b981", fontWeight: "bold" }}>
          ⬆️ Promoted to Admin
        </span>
      );
    } else {
      return (
        <span style={{ color: "#ef4444", fontWeight: "bold" }}>
          ⬇️ Demoted to User
        </span>
      );
    }
  };

  if (loading && users.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manage Users</h1>

      {/* Tabs */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #e5e7eb" }}>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeTab === "users" ? "#3b82f6" : "transparent",
            color: activeTab === "users" ? "white" : "#374151",
            cursor: "pointer",
            fontWeight: "bold",
            borderBottom: activeTab === "users" ? "3px solid #2563eb" : "none",
          }}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeTab === "audit" ? "#3b82f6" : "transparent",
            color: activeTab === "audit" ? "white" : "#374151",
            cursor: "pointer",
            fontWeight: "bold",
            borderBottom: activeTab === "audit" ? "3px solid #2563eb" : "none",
          }}
        >
          Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <>
          {/* Info Banner */}
          <div
            style={{
              backgroundColor: "#dbeafe",
              border: "2px solid #3b82f6",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <strong>ℹ️ User Management:</strong> You can promote users to admin
            or demote them to regular users. All privilege changes are logged in
            the Audit Log for security tracking.
          </div>

          {/* Filter and Search Section */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Filter by Role
              </label>
              <select
                value={filterAdmin}
                onChange={(e) => setFilterAdmin(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                }}
              >
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="user">Regular Users Only</option>
              </select>
            </div>
          </div>

          {/* Statistics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "15px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#3b82f6",
                }}
              >
                {users.length}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                Total Users
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "15px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                {users.filter((u) => u.is_admin === 1).length}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>Admins</div>
            </div>
            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "15px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#6b7280",
                }}
              >
                {users.filter((u) => u.is_admin === 0).length}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                Regular Users
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div
            style={{
              overflowX: "auto",
              backgroundColor: "white",
              borderRadius: "8px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    User ID
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    Username
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    Role
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    Registered
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.user_id}
                    style={{ borderBottom: "1px solid #e5e7eb" }}
                  >
                    <td style={{ padding: "12px" }}>{user.user_id}</td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {user.username}
                    </td>
                    <td style={{ padding: "12px" }}>{user.email}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {getUserBadge(user.is_admin)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() =>
                          handlePrivilegeChange(user.user_id, user.is_admin)
                        }
                        style={{
                          padding: "6px 12px",
                          backgroundColor: user.is_admin
                            ? "#ef4444"
                            : "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {user.is_admin
                          ? "⬇️ Demote to User"
                          : "⬆️ Promote to Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                <p>No users found matching your criteria.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && (
        <>
          {/* Info Banner */}
          <div
            style={{
              backgroundColor: "#fef3c7",
              border: "2px solid #f59e0b",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <strong>🔒 Security Audit Log:</strong> This log tracks all user
            privilege changes for security and compliance purposes. Shows who
            made changes and when.
          </div>

          {/* Audit Log Table */}
          <div
            style={{
              overflowX: "auto",
              backgroundColor: "white",
              borderRadius: "8px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    Date & Time
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    User
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    Action
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    Changed By
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr
                    key={log.log_id}
                    style={{ borderBottom: "1px solid #e5e7eb" }}
                  >
                    <td style={{ padding: "12px" }}>
                      {new Date(log.change_date).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {log.username || `User #${log.user_id}`}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {getActionBadge(
                        log.old_admin_status,
                        log.new_admin_status
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>{log.changed_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {auditLogs.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                <p>No audit logs available.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
