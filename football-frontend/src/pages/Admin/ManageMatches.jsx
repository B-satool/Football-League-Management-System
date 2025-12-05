import { useState, useEffect } from "react";
import { matchService } from "../../services/match.service";
import { adminService } from "../../services/admin.service";
import { teamService } from "../../services/team.service";
import "../../css/ManageMatches.css";

export default function ManageMatches() {
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");

  const uniqueSeasonYears = [
    ...new Map(seasons.map((s) => [s.year, s])).values(),
  ];

  const [formData, setFormData] = useState({
    season_id: "",
    league_id: "",
    matchday: "",
    home_team_id: "",
    away_team_id: "",
    utc_date: "",
  });

  const [scoreData, setScoreData] = useState({
    match_id: "",
    full_time_home: "",
    full_time_away: "",
    half_time_home: "",
    half_time_away: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadTeamsByLeague(selectedLeague);
    }
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedLeague && selectedSeason) {
      loadMatches();
    }
  }, [selectedLeague, selectedSeason]);

  const loadReferenceData = async () => {
    try {
      const [leaguesData, seasonsData] = await Promise.all([
        adminService.getLeagues(),
        adminService.getSeasons(),
      ]);

      setLeagues(leaguesData.leagues || []);

      const seasonsList = seasonsData.seasons || [];

      const uniqueSeasons = [
        ...new Map(seasonsList.map((s) => [s.year, s])).values(),
      ];

      setSeasons(uniqueSeasons);

      if (uniqueSeasons.length > 0) {
        setSelectedSeason(uniqueSeasons[0].season_id);
        setFormData((prev) => ({
          ...prev,
          season_id: uniqueSeasons[0].season_id,
        }));
      }
    } catch (error) {
      console.error("Error loading reference data:", error);
      alert("Error loading leagues and seasons: " + error.message);
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

  const loadMatches = async () => {
    try {
      const data = await matchService.getAllMatches({
        league_id: selectedLeague,
        season_id: selectedSeason,
        limit: 100,
      });
      setMatches(data.matches || []);
    } catch (error) {
      console.error("Error loading matches:", error);
      alert("Error loading matches: " + error.message);
    }
  };

  const handleLeagueChange = (leagueId) => {
    setSelectedLeague(leagueId);
    setFormData((prev) => ({
      ...prev,
      league_id: leagueId,
      home_team_id: "",
      away_team_id: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.home_team_id === formData.away_team_id) {
      alert("Home and away teams must be different!");
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        await matchService.updateMatch(editingId, formData);
        alert("Match updated successfully!");
      } else {
        await matchService.scheduleMatch(formData);
        alert("Match scheduled successfully!");
      }

      resetForm();
      loadMatches();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await matchService.updateScore(scoreData.match_id, {
        full_time_home: parseInt(scoreData.full_time_home),
        full_time_away: parseInt(scoreData.full_time_away),
        half_time_home: parseInt(scoreData.half_time_home) || 0,
        half_time_away: parseInt(scoreData.half_time_away) || 0,
      });

      alert(
        "Match score updated successfully! Standings will be automatically updated."
      );
      setShowScoreModal(false);
      resetScoreForm();
      loadMatches();
    } catch (error) {
      alert("Error updating score: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (match) => {
    setFormData({
      season_id: match.season_id,
      league_id: match.league_id,
      matchday: match.matchday,
      home_team_id: match.home_team_id,
      away_team_id: match.away_team_id,
      utc_date: match.utc_date.split("T")[0],
    });
    setEditingId(match.match_id);
    setSelectedLeague(match.league_id);
    setActiveTab("schedule");
  };

  const handleDelete = async (matchId) => {
    if (!confirm("Are you sure you want to delete this match?")) return;

    try {
      await matchService.deleteMatch(matchId);
      alert("Match deleted successfully!");
      loadMatches();
    } catch (error) {
      alert("Error deleting match: " + error.message);
    }
  };

  const openScoreModal = (match) => {
    setScoreData({
      match_id: match.match_id,
      full_time_home: match.full_time_home || "",
      full_time_away: match.full_time_away || "",
      half_time_home: match.half_time_home || "",
      half_time_away: match.half_time_away || "",
    });
    setShowScoreModal(true);
  };

  const resetForm = () => {
    setFormData({
      season_id: selectedSeason,
      league_id: selectedLeague,
      matchday: "",
      home_team_id: "",
      away_team_id: "",
      utc_date: "",
    });
    setEditingId(null);
  };

  const resetScoreForm = () => {
    setScoreData({
      match_id: "",
      full_time_home: "",
      full_time_away: "",
      half_time_home: "",
      half_time_away: "",
    });
  };

  const getMatchStatusBadge = (status) => {
    const statusClass = `status-badge status-${status.toLowerCase()}`;
    return <span className={statusClass}>{status}</span>;
  };

  return (
    <div className="manage-matches-container">
      <h1>Manage Matches</h1>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`schedule-update-btn ${activeTab === "schedule" ? "active" : ""}`}
          onClick={() => setActiveTab("schedule")}
        >
          Schedule Matches
        </button>
        <button
          className={`schedule-update-btn ${activeTab === "score" ? "active" : ""}`}
          onClick={() => setActiveTab("score")}
        >
          Update Scores
        </button>
      </div>

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <>
          <div className="card-container">
            <h2>{editingId ? "Edit Match" : "Schedule New Match"}</h2>
            <form onSubmit={handleSubmit} className="form-container">
              <div className="grid-2cols">
                <div>
                  <label className="form-label">Season *</label>
                  <select
                    className="form-select"
                    value={formData.season_id}
                    onChange={(e) => {
                      setFormData({ ...formData, season_id: e.target.value });
                      setSelectedSeason(e.target.value);
                    }}
                    required
                  >
                    <option value="">Select Season</option>
                    {seasons.map((season) => (
                      <option key={season.season_id} value={season.season_id}>
                        {season.year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">League *</label>
                  <select
                    className="form-select"
                    value={formData.league_id}
                    onChange={(e) => handleLeagueChange(e.target.value)}
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

              <div className="grid-3cols">
                <div>
                  <label className="form-label">Matchday *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={formData.matchday}
                    onChange={(e) =>
                      setFormData({ ...formData, matchday: e.target.value })
                    }
                    required
                    placeholder="e.g., 1"
                  />
                </div>

                <div>
                  <label className="form-label">Home Team *</label>
                  <select
                    className="form-select"
                    value={formData.home_team_id}
                    onChange={(e) =>
                      setFormData({ ...formData, home_team_id: e.target.value })
                    }
                    required
                    disabled={!formData.league_id}
                  >
                    <option value="">Select Home Team</option>
                    {teams.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Away Team *</label>
                  <select
                    className="form-select"
                    value={formData.away_team_id}
                    onChange={(e) =>
                      setFormData({ ...formData, away_team_id: e.target.value })
                    }
                    required
                    disabled={!formData.league_id}
                  >
                    <option value="">Select Away Team</option>
                    {teams.map((team) => (
                      <option
                        key={team.team_id}
                        value={team.team_id}
                        disabled={
                          team.team_id === parseInt(formData.home_team_id)
                        }
                      >
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Match Date *</label>
                <input
                  className="form-input"
                  type="date"
                  value={formData.utc_date}
                  onChange={(e) =>
                    setFormData({ ...formData, utc_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update Match"
                    : "Schedule Match"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      )}

      {/* Score Tab */}
      {activeTab === "score" && (
        <div className="tip-box">
          <strong>💡 Tip:</strong> Click "Add Score" button on any match below
          to update its score. Standings will be automatically recalculated!
        </div>
      )}

      {/* Filter Section */}
      <div className="filter-container">
        <div>
          <label className="form-label">Filter by League</label>
          <select
            className="form-select"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
          >
            <option value="">Select League</option>
            {leagues.map((league) => (
              <option key={league.league_id} value={league.league_id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Filter by Season</label>
          <select
            className="form-select"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            <option value="">Select Season</option>
            {uniqueSeasonYears.map((season) => (
              <option key={season.season_id} value={season.year}>
                {season.year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matches Table */}
      <div className="table-container">
        <table className="matches-table">
          <thead>
            <tr>
              <th>Matchday</th>
              <th>Date</th>
              <th>Home Team</th>
              <th className="center">Score</th>
              <th>Away Team</th>
              <th className="center">Status</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.match_id}>
                <td>{match.matchday}</td>
                <td>
                  {new Date(match.utc_date).toLocaleDateString()}
                </td>
                <td className="bold">{match.home_team}</td>
                <td className="center score-cell">
                  {match.full_time_home !== null &&
                  match.full_time_away !== null
                    ? `${match.full_time_home} - ${match.full_time_away}`
                    : "-"}
                </td>
                <td className="bold">{match.away_team}</td>
                <td className="center">
                  {getMatchStatusBadge(match.match_status)}
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <button
                      onClick={() => openScoreModal(match)}
                      className="btn-add-score"
                    >
                      {match.full_time_home !== null
                        ? "Edit Score"
                        : "Add Score"}
                    </button>
                    <button
                      onClick={() => handleEdit(match)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(match.match_id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {matches.length === 0 && (
          <div className="empty-state">
            <p>
              No matches found. Select a league and season, or schedule a new
              match.
            </p>
          </div>
        )}
      </div>

      {/* Score Modal */}
      {showScoreModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Update Match Score</h2>
            <form onSubmit={handleScoreSubmit}>
              <div className="score-section">
                <h3>Full Time Score</h3>
                <div className="grid-2cols">
                  <div>
                    <label className="form-label">Home Goals *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={scoreData.full_time_home}
                      onChange={(e) =>
                        setScoreData({
                          ...scoreData,
                          full_time_home: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Away Goals *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={scoreData.full_time_away}
                      onChange={(e) =>
                        setScoreData({
                          ...scoreData,
                          full_time_away: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="score-section">
                <h3>Half Time Score (Optional)</h3>
                <div className="grid-2cols">
                  <div>
                    <label className="form-label">Home Goals</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={scoreData.half_time_home}
                      onChange={(e) =>
                        setScoreData({
                          ...scoreData,
                          half_time_home: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Away Goals</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={scoreData.half_time_away}
                      onChange={(e) =>
                        setScoreData({
                          ...scoreData,
                          half_time_away: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowScoreModal(false);
                    resetScoreForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-success"
                >
                  {loading ? "Updating..." : "Update Score"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}