import { useState, useEffect } from "react";
import { teamService } from "../../services/team.service";
import { leagueService } from "../../services/league.service";

export default function ViewTeams() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load leagues on mount
  useEffect(() => {
    loadLeagues();
  }, []);

  // Load teams when league changes
  useEffect(() => {
    loadTeams();
  }, [selectedLeague]);

  const loadLeagues = async () => {
    try {
      const data = await leagueService.getAllLeagues();
      setLeagues(data.leagues || []);
    } catch (err) {
      console.error("Error loading leagues:", err);
      setError(err.message);
    }
  };

  const loadTeams = async () => {
    try {
      setLoading(true);
      const params = selectedLeague ? { league_id: selectedLeague } : {};
      const data = await teamService.getAllTeams(params);
      setTeams(data.teams || []);
    } catch (err) {
      console.error("Error loading teams:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading teams...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Teams</h1>

      {/* League Filter */}
      <select
        value={selectedLeague}
        onChange={(e) => setSelectedLeague(e.target.value)}
      >
        <option value="">All Leagues</option>
        {leagues.map((league) => (
          <option key={league.league_id} value={league.league_id}>
            {league.name}
          </option>
        ))}
      </select>

      {/* Teams Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {teams.map((team) => (
          <div
            key={team.team_id}
            style={{ border: "1px solid #ddd", padding: "15px" }}
          >
            {team.cresturl && (
              <img
                src={team.cresturl}
                alt={team.team_name}
                style={{ width: "50px" }}
              />
            )}
            <h3>{team.team_name}</h3>
            <p>League: {team.league_name}</p>
            <p>Stadium: {team.stadium_name}</p>
            <p>Coach: {team.coach_name}</p>
          </div>
        ))}
      </div>

      {teams.length === 0 && <p>No teams found</p>}
    </div>
  );
}
