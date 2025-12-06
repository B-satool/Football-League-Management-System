import { useState, useEffect } from "react";
import { teamService } from "../../services/team.service";
import { adminService } from "../../services/admin.service";
import "../../css/ManageTeams.css";

export default function ManageTeams() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    founded_year: "",
    stadium_id: "",
    league_id: "",
    coach_id: "",
    cresturl: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, leaguesData, stadiumsData, coachesData] =
        await Promise.all([
          teamService.getAllTeams(),
          adminService.getLeagues(),
          adminService.getStadiums(),
          adminService.getCoaches(),
        ]);

      setTeams(teamsData.teams || []);
      setLeagues(leaguesData.leagues || []);
      setStadiums(stadiumsData.stadiums || []);
      setCoaches(coachesData.coaches || []);
    } catch (error) {
      alert("Error loading data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await teamService.updateTeam(editingId, formData);
        alert("Team updated successfully!");
      } else {
        await teamService.addTeam(formData);
        alert("Team added successfully!");
      }

      resetForm();
      loadData();
      setShowForm(false);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team) => {
    setFormData({
      name: team.team_name,
      founded_year: team.founded_year || "",
      stadium_id: team.stadium_id || "",
      league_id: team.league_id,
      coach_id: team.coach_id || "",
      cresturl: team.cresturl || "",
    });
    setEditingId(team.team_id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (teamId) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      await teamService.deleteTeam(teamId);
      alert("Team deleted successfully!");
      loadData();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      founded_year: "",
      stadium_id: "",
      league_id: "",
      coach_id: "",
      cresturl: "",
    });
    setEditingId(null);
  };

  return (
    <div className="manage-teams-container">
      <div className="teams-header">
        <h1>Manage Teams</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
          className="btn-add-team"
        >
          {showForm ? "✕ Cancel" : "+ Add New Team"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="teams-form-container">
          <h2>{editingId ? "Edit Team" : "Add New Team"}</h2>
          <form onSubmit={handleSubmit} className="teams-form">
            <div className="teams-form-row">
              <div className="teams-form-group">
                <label className="teams-form-label">Team Name *</label>
                <input
                  type="text"
                  className="teams-form-input"
                  placeholder="e.g., Manchester United"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="teams-form-group">
                <label className="teams-form-label">League *</label>
                <select
                  className="teams-form-select"
                  value={formData.league_id}
                  onChange={(e) =>
                    setFormData({ ...formData, league_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select League</option>
                  {leagues.map((league) => (
                    <option key={league.league_id} value={league.league_id}>
                      {league.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="teams-form-row">
              <div className="teams-form-group">
                <label className="teams-form-label">Founded Year</label>
                <input
                  type="number"
                  className="teams-form-input"
                  placeholder="e.g., 1878"
                  value={formData.founded_year}
                  onChange={(e) =>
                    setFormData({ ...formData, founded_year: e.target.value })
                  }
                />
              </div>

              <div className="teams-form-group">
                <label className="teams-form-label">Stadium</label>
                <select
                  className="teams-form-select"
                  value={formData.stadium_id}
                  onChange={(e) =>
                    setFormData({ ...formData, stadium_id: e.target.value })
                  }
                >
                  <option value="">Select Stadium</option>
                  {stadiums.map((stadium) => (
                    <option key={stadium.stadium_id} value={stadium.stadium_id}>
                      {stadium.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="teams-form-row">
              <div className="teams-form-group">
                <label className="teams-form-label">Coach</label>
                <select
                  className="teams-form-select"
                  value={formData.coach_id}
                  onChange={(e) =>
                    setFormData({ ...formData, coach_id: e.target.value })
                  }
                >
                  <option value="">Select Coach</option>
                  {coaches.map((coach) => (
                    <option key={coach.coach_id} value={coach.coach_id}>
                      {coach.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="teams-form-group">
                <label className="teams-form-label">Crest URL</label>
                <input
                  type="url"
                  className="teams-form-input"
                  placeholder="https://example.com/crest.png"
                  value={formData.cresturl}
                  onChange={(e) =>
                    setFormData({ ...formData, cresturl: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="teams-form-actions">
              <button type="submit" disabled={loading} className="btn-submit">
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Team"
                  : "Add Team"}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams Table */}
      {loading && !showForm ? (
        <div className="teams-loading">
          <p>Loading teams...</p>
        </div>
      ) : (
        <div className="teams-table-container">
          <table className="teams-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Crest</th>
                <th>Name</th>
                <th>League</th>
                <th>Stadium</th>
                <th>Coach</th>
                <th>Founded</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.team_id}>
                  <td>{team.team_id}</td>
                  <td>
                    {team.cresturl ? (
                      <img
                        src={team.cresturl}
                        alt={team.team_name}
                        className="team-crest-preview"
                      />
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="bold">{team.team_name}</td>
                  <td>{team.league_name}</td>
                  <td>{team.stadium_name || "N/A"}</td>
                  <td>{team.coach_name || "N/A"}</td>
                  <td>{team.founded_year || "N/A"}</td>
                  <td className="center">
                    <div className="team-actions">
                      <button
                        onClick={() => handleEdit(team)}
                        className="btn-edit-team"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(team.team_id)}
                        className="btn-delete-team"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {teams.length === 0 && (
            <div className="teams-empty-state">
              <p>No teams found. Add a new team to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Total Count */}
      {teams.length > 0 && (
        <div className="teams-count">
          Showing {teams.length} team{teams.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}