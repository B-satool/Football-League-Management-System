import { useState, useEffect } from "react";
import { teamService } from "../../services/team.service";
import { adminService } from "../../services/admin.service";

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
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
    <div>
      <h1>Manage Teams</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Team Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Founded Year"
          value={formData.founded_year}
          onChange={(e) =>
            setFormData({ ...formData, founded_year: e.target.value })
          }
        />

        <select
          value={formData.league_id}
          onChange={(e) =>
            setFormData({ ...formData, league_id: e.target.value })
          }
          required
        >
          <option value="">Select League *</option>
          {leagues.map((league) => (
            <option key={league.league_id} value={league.league_id}>
              {league.name}
            </option>
          ))}
        </select>

        <select
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

        <select
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

        <input
          type="url"
          placeholder="Crest URL"
          value={formData.cresturl}
          onChange={(e) =>
            setFormData({ ...formData, cresturl: e.target.value })
          }
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : editingId ? "Update Team" : "Add Team"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {/* Teams Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>League</th>
            <th>Stadium</th>
            <th>Coach</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.team_id}>
              <td>{team.team_id}</td>
              <td>{team.team_name}</td>
              <td>{team.league_name}</td>
              <td>{team.stadium_name}</td>
              <td>{team.coach_name}</td>
              <td>
                <button onClick={() => handleEdit(team)}>Edit</button>
                <button onClick={() => handleDelete(team.team_id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
