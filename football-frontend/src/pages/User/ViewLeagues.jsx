import { useState, useEffect } from "react";
import { leagueService } from "../../services/league.service";

export default function ViewLeagues() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [leagueStats, setLeagueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("standings"); // standings, scorers, stats

  const uniqueSeasonYears = [
    ...new Map(seasons.map((s) => [s.year, s])).values(),
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedLeague && selectedSeason) {
      loadLeagueData();
    }
  }, [selectedLeague, selectedSeason]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load leagues
      const leaguesData = await leagueService.getAllLeagues();
      setLeagues(leaguesData.leagues || []);

      // Load seasons from the API
      const response = await fetch("http://localhost:5000/api/seasons");
      const seasonsData = await response.json();
      setSeasons(seasonsData.seasons || []);

      // Set defaults
      if (leaguesData.leagues && leaguesData.leagues.length > 0) {
        setSelectedLeague(leaguesData.leagues[0].league_id);
      }

      if (seasonsData.seasons && seasonsData.seasons.length > 0) {
        // Get the most recent season
        setSelectedSeason(seasonsData.seasons[0].season_id);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      alert("Error loading data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLeagueData = async () => {
    try {
      setLoading(true);

      // Load standings
      try {
        const standingsData = await leagueService.getStandings({
          league_id: selectedLeague,
          season_id: selectedSeason,
        });
        console.log("Standings data:", standingsData);
        setStandings(standingsData.standings || []);
      } catch (error) {
        console.error("Error loading standings:", error);
        setStandings([]);
      }

      // Load top scorers
      try {
        const scorersData = await leagueService.getTopScorers({
          league_id: selectedLeague,
          season_id: selectedSeason,
          limit: 10,
        });
        console.log("Top scorers data:", scorersData);
        setTopScorers(scorersData.top_scorers || []);
      } catch (error) {
        console.error("Error loading top scorers:", error);
        setTopScorers([]);
      }

      // Load league statistics
      try {
        const statsData = await leagueService.getLeagueStats(selectedLeague, {
          season_id: selectedSeason,
        });
        console.log("League stats data:", statsData);
        setLeagueStats(statsData.statistics || null);
      } catch (error) {
        console.error("Error loading league stats:", error);
        setLeagueStats(null);
      }
    } catch (error) {
      console.error("Error loading league data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFormBadge = (formArray) => {
    if (!formArray || formArray.length === 0) return null;

    // Parse JSON string if needed
    let formData = formArray;
    if (typeof formArray === "string") {
      try {
        formData = JSON.parse(formArray);
      } catch (e) {
        console.error("Error parsing form data:", e);
        return null;
      }
    }

    // Ensure it's an array
    if (!Array.isArray(formData)) return null;

    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {formData.slice(-5).map((result, index) => (
          <span
            key={index}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "bold",
              color: "white",
              backgroundColor:
                result === "W"
                  ? "#10b981"
                  : result === "D"
                  ? "#f59e0b"
                  : "#ef4444",
            }}
          >
            {result}
          </span>
        ))}
      </div>
    );
  };

  const getPositionStyle = (position) => {
    if (position <= 4) {
      return {
        backgroundColor: "#dbeafe",
        color: "#1e40af",
        fontWeight: "bold",
      };
    } else if (position >= standings.length - 2) {
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        fontWeight: "bold",
      };
    }
    return {};
  };

  const currentLeague = leagues.find((l) => l.league_id === selectedLeague);

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ marginBottom: "10px" }}>Leagues</h1>
        <p style={{ color: "#6b7280" }}>
          View league standings, top scorers, and statistics
        </p>
      </div>

      {/* League Selector */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        {leagues.map((league) => (
          <div
            key={league.league_id}
            onClick={() => setSelectedLeague(league.league_id)}
            style={{
              padding: "20px",
              borderRadius: "8px",
              border:
                selectedLeague === league.league_id
                  ? "3px solid #3b82f6"
                  : "2px solid #e5e7eb",
              backgroundColor:
                selectedLeague === league.league_id ? "#dbeafe" : "white",
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>
              {league.logo_url ? (
                <img
                  src={league.logo_url}
                  alt={league.name}
                  style={{ width: "50px", height: "50px" }}
                />
              ) : (
                "🏆"
              )}
            </div>
            <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>
              {league.name}
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
              {league.country}
            </p>
          </div>
        ))}
      </div>

      {/* League Info Banner */}
      {currentLeague && (
        <div
          style={{
            backgroundColor: "#f3f4f6",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 5px 0" }}>{currentLeague.name}</h2>
              <p style={{ margin: 0, color: "#6b7280" }}>
                {currentLeague.country}
              </p>
            </div>
            {leagueStats && leagueStats.total_matches && (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#3b82f6",
                  }}
                >
                  {leagueStats.total_matches.total_matches || 0}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  Matches Played
                </div>
              </div>
            )}
          </div>

          {/* Season Selector */}
          {seasons.length > 0 && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Select Season
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  minWidth: "150px",
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
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #e5e7eb" }}>
        <button
          onClick={() => setActiveTab("standings")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeTab === "standings" ? "#3b82f6" : "transparent",
            color: activeTab === "standings" ? "white" : "#374151",
            cursor: "pointer",
            fontWeight: "bold",
            borderBottom:
              activeTab === "standings" ? "3px solid #2563eb" : "none",
          }}
        >
          📊 Standings
        </button>
        <button
          onClick={() => setActiveTab("scorers")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeTab === "scorers" ? "#3b82f6" : "transparent",
            color: activeTab === "scorers" ? "white" : "#374151",
            cursor: "pointer",
            fontWeight: "bold",
            borderBottom:
              activeTab === "scorers" ? "3px solid #2563eb" : "none",
          }}
        >
          ⚽ Top Scorers
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeTab === "stats" ? "#3b82f6" : "transparent",
            color: activeTab === "stats" ? "white" : "#374151",
            cursor: "pointer",
            fontWeight: "bold",
            borderBottom: activeTab === "stats" ? "3px solid #2563eb" : "none",
          }}
        >
          📈 Statistics
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <p>Loading data...</p>
        </div>
      )}

      {/* Standings Tab */}
      {!loading && activeTab === "standings" && (
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
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "50px",
                  }}
                >
                  Pos
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
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "60px",
                  }}
                >
                  MP
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "60px",
                  }}
                >
                  W
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "60px",
                  }}
                >
                  D
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "60px",
                  }}
                >
                  L
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "80px",
                  }}
                >
                  GF
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "80px",
                  }}
                >
                  GA
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "80px",
                  }}
                >
                  GD
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "80px",
                  }}
                >
                  Pts
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "150px",
                  }}
                >
                  Form
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => (
                <tr
                  key={team.team_id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    ...getPositionStyle(team.position),
                  }}
                >
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {team.position}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {team.cresturl && (
                        <img
                          src={team.cresturl}
                          alt={team.team_name}
                          style={{
                            width: "30px",
                            height: "30px",
                            objectFit: "contain",
                          }}
                        />
                      )}
                      <span style={{ fontWeight: "bold" }}>
                        {team.team_name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {team.played_games}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {team.won}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {team.draw}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {team.lost}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {team.goals_for}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {team.goals_against}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {team.goal_difference > 0 ? "+" : ""}
                    {team.goal_difference}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {team.points}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {getFormBadge(team.form)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {standings.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
            >
              <p>No standings data available for this league and season.</p>
            </div>
          )}

          {/* Legend */}
          {standings.length > 0 && (
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f9fafb",
                borderTop: "1px solid #e5e7eb",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              <strong>Legend:</strong> MP = Matches Played, W = Won, D = Draw, L
              = Lost, GF = Goals For, GA = Goals Against, GD = Goal Difference,
              Pts = Points
              <br />
              <span style={{ color: "#1e40af" }}>■</span> Top 4 (Champions
              League) •<span style={{ color: "#991b1b" }}> ■</span> Relegation
              Zone
            </div>
          )}
        </div>
      )}

      {/* Top Scorers Tab */}
      {!loading && activeTab === "scorers" && (
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
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    width: "50px",
                  }}
                >
                  Rank
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Player
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
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Goals
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Assists
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Penalties
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Non-Penalty Goals
                </th>
              </tr>
            </thead>
            <tbody>
              {topScorers.map((scorer, index) => (
                <tr
                  key={scorer.scorer_id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    backgroundColor: index < 3 ? "#fef3c7" : "white",
                  }}
                >
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        margin: "0 auto",
                        borderRadius: "50%",
                        backgroundColor:
                          index === 0
                            ? "#fbbf24"
                            : index === 1
                            ? "#d1d5db"
                            : index === 2
                            ? "#cd7f32"
                            : "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: index < 3 ? "white" : "#374151",
                      }}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    {scorer.player_name}
                  </td>
                  <td style={{ padding: "12px" }}>{scorer.team_name}</td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#3b82f6",
                    }}
                  >
                    {scorer.goals}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {scorer.assists || 0}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {scorer.penalties || 0}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {scorer.non_penalty_goals || scorer.goals}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {topScorers.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
            >
              <p>No top scorers data available for this league and season.</p>
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {!loading && activeTab === "stats" && leagueStats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              border: "2px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "5px",
              }}
            >
              Total Goals
            </div>
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#3b82f6" }}
            >
              {leagueStats.total_goals?.total_goals || 0}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              border: "2px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "5px",
              }}
            >
              Matches Played
            </div>
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#10b981" }}
            >
              {leagueStats.total_matches?.total_matches || 0}
            </div>
          </div>

          {leagueStats.top_scoring_team && (
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "5px",
                }}
              >
                Top Scoring Team
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                }}
              >
                {leagueStats.top_scoring_team.team_name}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#f59e0b",
                }}
              >
                {leagueStats.top_scoring_team.goals_for} goals
              </div>
            </div>
          )}

          {leagueStats.best_defense && (
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "5px",
                }}
              >
                Best Defense
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                }}
              >
                {leagueStats.best_defense.team_name}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#ef4444",
                }}
              >
                {leagueStats.best_defense.goals_against} conceded
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
