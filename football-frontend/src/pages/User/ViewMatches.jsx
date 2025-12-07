import { useState, useEffect } from "react";
import { matchService } from "../../services/match.service";
import { leagueService } from "../../services/league.service";

export default function ViewMatches() {
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all"); // all, upcoming, past, today
  const [selectedMatchday, setSelectedMatchday] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMatchDetail, setShowMatchDetail] = useState(false);

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    loadMatches();
  }, [selectedLeague, selectedStatus, selectedMatchday]);

  const loadLeagues = async () => {
    try {
      const data = await leagueService.getAllLeagues();
      setLeagues(data.leagues || []);
    } catch (error) {
      console.error("Error loading leagues:", error);
    }
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      const params = {
        status: selectedStatus,
        limit: 100,
      };

      if (selectedLeague) params.league_id = selectedLeague;
      if (selectedMatchday) params.matchday = selectedMatchday;

      const data = await matchService.getAllMatches(params);
      setMatches(data.matches || []);
    } catch (error) {
      console.error("Error loading matches:", error);
      alert("Error loading matches: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openMatchDetail = async (match) => {
    try {
      const data = await matchService.getMatchById(match.match_id);
      setSelectedMatch(data.match);
      setShowMatchDetail(true);
    } catch (error) {
      console.error("Error loading match details:", error);
      alert("Error loading match details: " + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      UPCOMING: { bg: "#dbeafe", color: "#1e40af", icon: "📅" },
      TODAY: { bg: "#fef3c7", color: "#92400e", icon: "🔴" },
      COMPLETED: { bg: "#d1fae5", color: "#065f46", icon: "✅" },
    };
    const style = colors[status] || colors["UPCOMING"];

    return (
      <span
        style={{
          padding: "6px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "bold",
          backgroundColor: style.bg,
          color: style.color,
        }}
      >
        {style.icon} {status}
      </span>
    );
  };

  const getWinnerHighlight = (match, team) => {
    if (!match.winner || match.winner === "DRAW") return { color: "#374151" };

    if (
      (team === "home" && match.winner === "HOME_TEAM") ||
      (team === "away" && match.winner === "AWAY_TEAM")
    ) {
      return { fontWeight: "bold", color: "#059669" };
    }
    return { color: "#6b7280" };
  };

  const groupMatchesByDate = () => {
    const grouped = {};
    matches.forEach((match) => {
      const date = new Date(match.utc_date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(match);
    });
    return grouped;
  };

  const groupedMatches = groupMatchesByDate();

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "10px" }}>Matches</h1>
      <p style={{ color: "#6b7280", marginBottom: "30px" }}>
        View upcoming and past matches with scores
      </p>

      {/* Filters */}
      <div
        style={{
          backgroundColor: "#616262ff",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "2px solid #e5e7eb",
        }}
      >
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
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
              }}
            >
              <option value="all">All Matches</option>
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="past">Past Matches</option>
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
              League
            </label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
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
              Matchday
            </label>
            <input
              type="number"
              min="1"
              value={selectedMatchday}
              onChange={(e) => setSelectedMatchday(e.target.value)}
              placeholder="All matchdays"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setSelectedStatus("today")}
          style={{
            padding: "10px 20px",
            backgroundColor: selectedStatus === "today" ? "#f59e0b" : "#f3f4f6",
            color: selectedStatus === "today" ? "white" : "#374151",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🔴 Today's Matches
        </button>
        <button
          onClick={() => setSelectedStatus("upcoming")}
          style={{
            padding: "10px 20px",
            backgroundColor:
              selectedStatus === "upcoming" ? "#3b82f6" : "#f3f4f6",
            color: selectedStatus === "upcoming" ? "white" : "#374151",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📅 Upcoming
        </button>
        <button
          onClick={() => setSelectedStatus("past")}
          style={{
            padding: "10px 20px",
            backgroundColor: selectedStatus === "past" ? "#10b981" : "#f3f4f6",
            color: selectedStatus === "past" ? "white" : "#374151",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ✅ Results
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <p>Loading matches...</p>
        </div>
      )}

      {/* Matches Grouped by Date */}
      {!loading && Object.keys(groupedMatches).length > 0
        ? Object.entries(groupedMatches).map(([date, dateMatches]) => (
            <div key={date} style={{ marginBottom: "30px" }}>
              <h2
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: "10px 15px",
                  borderRadius: "4px",
                  fontSize: "16px",
                  marginBottom: "15px",
                  color: "#374151",
                }}
              >
                {date}
              </h2>

              <div style={{ display: "grid", gap: "15px" }}>
                {dateMatches.map((match) => (
                  <div
                    key={match.match_id}
                    onClick={() => openMatchDetail(match)}
                    style={{
                      backgroundColor: "white",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "20px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#3b82f6";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        gap: "20px",
                        alignItems: "center",
                      }}
                    >
                      {/* Home Team */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "10px",
                          ...getWinnerHighlight(match, "home"),
                        }}
                      >
                        <span
                          style={{
                            fontSize: "18px",
                            textAlign: "right",
                          }}
                        >
                          {match.home_team}
                        </span>
                        {match.home_crest && (
                          <img
                            src={match.home_crest}
                            alt={match.home_team}
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "contain",
                            }}
                          />
                        )}
                      </div>

                      {/* Score or Time */}
                      <div style={{ textAlign: "center", minWidth: "120px" }}>
                        {match.full_time_home !== null &&
                        match.full_time_away !== null ? (
                          <div>
                            <div
                              style={{
                                fontSize: "32px",
                                fontWeight: "bold",
                                color: "#1f2937",
                              }}
                            >
                              {match.full_time_home} - {match.full_time_away}
                            </div>
                            {match.half_time_home !== null &&
                              match.half_time_away !== null && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    marginTop: "5px",
                                  }}
                                >
                                  HT: {match.half_time_home} -{" "}
                                  {match.half_time_away}
                                </div>
                              )}
                          </div>
                        ) : (
                          <div>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: "#3b82f6",
                              }}
                            >
                              {new Date(match.utc_date).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginTop: "5px",
                              }}
                            >
                              Kickoff
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Away Team */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          ...getWinnerHighlight(match, "away"),
                        }}
                      >
                        {match.away_crest && (
                          <img
                            src={match.away_crest}
                            alt={match.away_team}
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "contain",
                            }}
                          />
                        )}
                        <span style={{ fontSize: "18px" }}>
                          {match.away_team}
                        </span>
                      </div>
                    </div>

                    {/* Match Info */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "15px",
                        paddingTop: "15px",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ fontSize: "13px", color: "#6b7280" }}>
                        <strong>{match.league_name}</strong> • Matchday{" "}
                        {match.matchday}
                      </div>
                      {getStatusBadge(match.match_status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        : !loading && (
            <div
              style={{
                textAlign: "center",
                padding: "60px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚽</div>
              <h2 style={{ color: "#6b7280" }}>No matches found</h2>
              <p style={{ color: "#9ca3af" }}>
                Try adjusting your filters to see more matches
              </p>
            </div>
          )}

      {/* Match Detail Modal */}
      {showMatchDetail && selectedMatch && (
        <div
          onClick={() => setShowMatchDetail(false)}
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
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "20px",
                borderBottom: "2px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  {selectedMatch.league_name} • Matchday{" "}
                  {selectedMatch.matchday}
                </div>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {new Date(selectedMatch.utc_date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowMatchDetail(false)}
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Match Score */}
            <div style={{ padding: "30px", textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                {/* Home Team */}
                <div style={{ flex: 1, textAlign: "center" }}>
                  {selectedMatch.home_crest && (
                    <img
                      src={selectedMatch.home_crest}
                      alt={selectedMatch.home_team}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                        marginBottom: "10px",
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#6b7280",
                      ...getWinnerHighlight(selectedMatch, "home"),
                    }}
                  >
                    {selectedMatch.home_team}
                  </div>
                </div>

                {/* Score */}
                <div style={{ padding: "0 30px" }}>
                  {selectedMatch.full_time_home !== null ? (
                    <div>
                      <div
                        style={{
                          fontSize: "48px",
                          fontWeight: "bold",
                          color: "#1f2937",
                        }}
                      >
                        {selectedMatch.full_time_home} -{" "}
                        {selectedMatch.full_time_away}
                      </div>
                      {selectedMatch.half_time_home !== null && (
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginTop: "10px",
                          }}
                        >
                          Half Time: {selectedMatch.half_time_home} -{" "}
                          {selectedMatch.half_time_away}
                        </div>
                      )}
                      <div style={{ marginTop: "10px" }}>
                        {getStatusBadge(selectedMatch.match_status)}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "24px", color: "#6b7280" }}>
                        VS
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#9ca3af",
                          marginTop: "10px",
                        }}
                      >
                        Not yet played
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        {getStatusBadge(selectedMatch.match_status)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div style={{ flex: 1, textAlign: "center" }}>
                  {selectedMatch.away_crest && (
                    <img
                      src={selectedMatch.away_crest}
                      alt={selectedMatch.away_team}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                        marginBottom: "10px",
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#6b7280",
                      ...getWinnerHighlight(selectedMatch, "away"),
                    }}
                  >
                    {selectedMatch.away_team}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "20px",
                borderTop: "2px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "5px",
                    }}
                  >
                    Competition
                  </div>
                  <div style={{ fontWeight: "bold", color: "#6b7280" }}>
                    {selectedMatch.league_name}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "5px",
                    }}
                  >
                    Season
                  </div>
                  <div style={{ fontWeight: "bold", color: "#6b7280" }}>
                    {selectedMatch.season_year}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && matches.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Showing {matches.length} match{matches.length !== 1 ? "es" : ""}
        </div>
      )}
    </div>
  );
}
