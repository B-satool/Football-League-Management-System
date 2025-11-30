import { useState, useEffect } from "react";
import { playerService } from "../../services/player.service";
import { teamService } from "../../services/team.service";
import { adminService } from "../../services/admin.service";

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export default function ManagePlayers() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    team_id: "",
    position: "",
    date_of_birth: "",
    nationality: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadLeagues();
    loadAllPlayers();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadTeamsByLeague(selectedLeague);
    } else {
      loadAllTeams();
    }
  }, [selectedLeague]);

  useEffect(() => {
    loadFilteredPlayers();
  }, [selectedTeam, selectedPosition, searchTerm]);

  const loadLeagues = async () => {
    try {
      const data = await adminService.getLeagues();
      setLeagues(data.leagues || []);
    } catch (error) {
      console.error("Error loading leagues:", error);
    }
  };

  const loadAllTeams = async () => {
    try {
      const data = await teamService.getAllTeams();
      setTeams(data.teams || []);
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  const loadTeamsByLeague = async (leagueId) => {
    try {
      const data = await teamService.getAllTeams({ league_id: leagueId });
      setTeams(data.teams || []);
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  const loadAllPlayers = async () => {
    try {
      setLoading(true);
      const data = await playerService.getAllPlayers();
      setPlayers(data.players || []);
    } catch (error) {
      console.error("Error loading players:", error);
      alert("Error loading players: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredPlayers = async () => {
    try {
      setLoading(true);
      const params = {};

      if (selectedTeam) params.team_id = selectedTeam;
      if (selectedPosition) params.position = selectedPosition;

      const data = await playerService.getAllPlayers(params);
      let filtered = data.players || [];

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (player) =>
            player.player_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (player.nationality &&
              player.nationality
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        );
      }

      setPlayers(filtered);
    } catch (error) {
      console.error("Error loading players:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await playerService.updatePlayer(editingId, formData);
        alert("Player updated successfully!");
      } else {
        await playerService.addPlayer(formData);
        alert("Player added successfully!");
      }

      resetForm();
      loadFilteredPlayers();
      setShowForm(false);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (player) => {
    setFormData({
      name: player.player_name,
      team_id: player.team_id,
      position: player.position,
      date_of_birth: player.date_of_birth
        ? player.date_of_birth.split("T")[0]
        : "",
      nationality: player.nationality || "",
    });
    setEditingId(player.player_id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (playerId) => {
    if (!confirm("Are you sure you want to delete this player?")) return;

    try {
      await playerService.deletePlayer(playerId);
      alert("Player deleted successfully!");
      loadFilteredPlayers();
    } catch (error) {
      alert("Error deleting player: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      team_id: "",
      position: "",
      date_of_birth: "",
      nationality: "",
    });
    setEditingId(null);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getPositionColor = (position) => {
    const colors = {
      Goalkeeper: "#ef4444",
      Defender: "#3b82f6",
      Midfielder: "#10b981",
      Forward: "#f59e0b",
    };
    return colors[position] || "#6b7280";
  };

  const getPositionBadge = (position) => {
    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "bold",
          backgroundColor: getPositionColor(position),
          color: "white",
        }}
      >
        {position}
      </span>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Manage Players</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: showForm ? "#6b7280" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add New Player"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div
          style={{
            backgroundColor: "#f3f4f6",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
            border: "2px solid #e5e7eb",
          }}
        >
          <h2>{editingId ? "Edit Player" : "Add New Player"}</h2>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "15px",
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
                  Player Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Lionel Messi"
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
                  Team *
                </label>
                <select
                  value={formData.team_id}
                  onChange={(e) =>
                    setFormData({ ...formData, team_id: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                  }}
                >
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team.team_id} value={team.team_id}>
                      {team.team_name} - {team.league_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "15px",
                marginBottom: "15px",
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
                  Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                  }}
                >
                  <option value="">Select Position</option>
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
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
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                  placeholder="e.g., Argentina"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Player"
                  : "Add Player"}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Section */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
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
              Search Players
            </label>
            <input
              type="text"
              placeholder="Search by name or nationality..."
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
              Filter by League
            </label>
            <select
              value={selectedLeague}
              onChange={(e) => {
                setSelectedLeague(e.target.value);
                setSelectedTeam(""); // Reset team filter
              }}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            >
              <option value="">All Leagues</option>
              {leagues.map((league) => (
                <option key={league.league_id} value={league.league_id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Filter by Team
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Filter by Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            >
              <option value="">All Positions</option>
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
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
            style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}
          >
            {players.length}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Total Players
          </div>
        </div>
        {POSITIONS.map((position) => (
          <div
            key={position}
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
                color: getPositionColor(position),
              }}
            >
              {players.filter((p) => p.position === position).length}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {position}s
            </div>
          </div>
        ))}
      </div>

      {/* Players Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading players...</p>
        </div>
      ) : (
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
                  Player ID
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Position
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Team
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  League
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Age
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Nationality
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
              {players.map((player) => (
                <tr
                  key={player.player_id}
                  style={{ borderBottom: "1px solid #e5e7eb" }}
                >
                  <td style={{ padding: "12px" }}>{player.player_id}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    {player.player_name}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {getPositionBadge(player.position)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {player.team_name || "N/A"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {player.league_name || "N/A"}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {calculateAge(player.date_of_birth)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {player.nationality || "N/A"}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "5px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => handleEdit(player)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(player.player_id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {players.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
            >
              <p>
                No players found. Try adjusting your filters or add a new
                player.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Total Count */}
      {players.length > 0 && (
        <div
          style={{
            marginTop: "15px",
            textAlign: "right",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Showing {players.length} player{players.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
