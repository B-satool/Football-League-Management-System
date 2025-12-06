import { useState, useEffect } from "react";
import { matchService } from "../../services/match.service";
import { adminService } from "../../services/admin.service";
import { teamService } from "../../services/team.service";

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
  const [activeTab, setActiveTab] = useState("schedule"); // 'schedule' or 'score'

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

      // Set default season to latest
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
      utc_date: match.utc_date.split("T")[0], // Format date for input
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
    const colors = {
      UPCOMING: "#3b82f6",
      TODAY: "#f59e0b",
      COMPLETED: "#10b981",
    };
    return (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: "4px",
          backgroundColor: colors[status] || "#6b7280",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manage Matches</h1>

      {/* Tabs */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #e5e7eb" }}>
        <button
          onClick={() => setActiveTab("schedule")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeTab === "schedule" ? "#516082ff" : "transparent",
            color: activeTab === "schedule" ? "white" : "#374151",
            cursor: "pointer",
            fontWeight: "bold",
            borderBottom:
              activeTab === "schedule" ? "3px solid #516082ff" : "none",
          }}
        >
          Schedule Matches
        </button>
        <button
          onClick={() => setActiveTab("score")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeTab === "score" ? "#516082ff" : "transparent",
            color: activeTab === "score" ? "white" : "#374151",
            cursor: "pointer",
            fontWeight: "bold",
            borderBottom:
              activeTab === "score" ? "3px solid #516082ff" : "none",
          }}
        >
          Update Scores
        </button>
      </div>

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <>
          <div
            style={{
              backgroundColor: "#7e7e7eff",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "30px",
            }}
          >
            <h2>{editingId ? "Edit Match" : "Schedule New Match"}</h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: "15px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
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
                    Season *
                  </label>
                  <select
                    value={formData.season_id}
                    onChange={(e) => {
                      setFormData({ ...formData, season_id: e.target.value });
                      setSelectedSeason(e.target.value);
                    }}
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #d1d5db",
                    }}
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
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    League *
                  </label>
                  <select
                    value={formData.league_id}
                    onChange={(e) => handleLeagueChange(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #d1d5db",
                    }}
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
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
                    Matchday *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.matchday}
                    onChange={(e) =>
                      setFormData({ ...formData, matchday: e.target.value })
                    }
                    required
                    placeholder="e.g., 1"
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
                    Home Team *
                  </label>
                  <select
                    value={formData.home_team_id}
                    onChange={(e) =>
                      setFormData({ ...formData, home_team_id: e.target.value })
                    }
                    required
                    disabled={!formData.league_id}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #d1d5db",
                    }}
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
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Away Team *
                  </label>
                  <select
                    value={formData.away_team_id}
                    onChange={(e) =>
                      setFormData({ ...formData, away_team_id: e.target.value })
                    }
                    required
                    disabled={!formData.league_id}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #d1d5db",
                    }}
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
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Match Date *
                </label>
                <input
                  type="date"
                  value={formData.utc_date}
                  onChange={(e) =>
                    setFormData({ ...formData, utc_date: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="button-submit"
                  type="submit"
                  disabled={loading}
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
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "rgb(239, 68, 68)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
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
        <div
          style={{
            backgroundColor: "#979694ff",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "2px solid #fbbf24",
          }}
        >
          <strong>💡 Tip:</strong> Click "Add Score" button on any match below
          to update its score. Standings will be automatically recalculated!
        </div>
      )}

      {/* Filter Section */}
      <div
        style={{
          backgroundColor: "#7c7d7eff",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
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
            Filter by League
          </label>
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
            }}
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
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Filter by Season
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
            }}
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
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            color: "#333",
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#7c7d7eff" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                Matchday
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                Home Team
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                Score
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                Away Team
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                Status
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
            {matches.map((match) => (
              <tr
                key={match.match_id}
                style={{ borderBottom: "1px solid #ffffff" }}
              >
                <td style={{ padding: "12px" }}>{match.matchday}</td>
                <td style={{ padding: "12px" }}>
                  {new Date(match.utc_date).toLocaleDateString()}
                </td>
                <td style={{ padding: "12px", fontWeight: "bold" }}>
                  {match.home_team}
                </td>
                <td
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {match.full_time_home !== null &&
                  match.full_time_away !== null
                    ? `${match.full_time_home} - ${match.full_time_away}`
                    : "-"}
                </td>
                <td style={{ padding: "12px", fontWeight: "bold" }}>
                  {match.away_team}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {getMatchStatusBadge(match.match_status)}
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
                      onClick={() => openScoreModal(match)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      {match.full_time_home !== null
                        ? "Edit Score"
                        : "Add Score"}
                    </button>
                    <button
                      onClick={() => handleEdit(match)}
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
                      onClick={() => handleDelete(match.match_id)}
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

        {matches.length === 0 && (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
          >
            <p>
              No matches found. Select a league and season, or schedule a new
              match.
            </p>
          </div>
        )}
      </div>

      {/* Score Modal */}
      {showScoreModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "grey",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "100%",
            }}
          >
            <h2>Update Match Score</h2>
            <form onSubmit={handleScoreSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <h3>Full Time Score</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
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
                      Home Goals *
                    </label>
                    <input
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
                      Away Goals *
                    </label>
                    <input
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
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3>Half Time Score (Optional)</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
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
                      Home Goals
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={scoreData.half_time_home}
                      onChange={(e) =>
                        setScoreData({
                          ...scoreData,
                          half_time_home: e.target.value,
                        })
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
                      Away Goals
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={scoreData.half_time_away}
                      onChange={(e) =>
                        setScoreData({
                          ...scoreData,
                          half_time_away: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowScoreModal(false);
                    resetScoreForm();
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
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
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
