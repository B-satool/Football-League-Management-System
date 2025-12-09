// API base URL - change this based on your environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5173";
// might have to change to 5000 instead of 5173 if you run on your device
export const API_ENDPOINTS = {
  // Admin endpoints
  ADMIN: {
    USERS: `${API_BASE_URL}/api/admin/users`,
    USER_PRIVILEGE: (userId) =>
      `${API_BASE_URL}/api/admin/users/${userId}/privilege`,
    AUDIT_LOG: `${API_BASE_URL}/api/admin/users/audit-log`,

    TEAMS: `${API_BASE_URL}/api/admin/teams`,
    TEAM_BY_ID: (teamId) => `${API_BASE_URL}/api/admin/teams/${teamId}`,

    PLAYERS: `${API_BASE_URL}/api/admin/players`,
    PLAYER_BY_ID: (playerId) => `${API_BASE_URL}/api/admin/players/${playerId}`,

    MATCHES: `${API_BASE_URL}/api/admin/matches`,
    MATCH_BY_ID: (matchId) => `${API_BASE_URL}/api/admin/matches/${matchId}`,
    MATCH_SCORE: (matchId) =>
      `${API_BASE_URL}/api/admin/matches/${matchId}/score`,

    RECOMPUTE_STANDINGS: `${API_BASE_URL}/api/admin/standings/recompute`,
    LEAGUES: `${API_BASE_URL}/api/admin/leagues`,
    SEASONS: `${API_BASE_URL}/api/admin/seasons`,
    STADIUMS: `${API_BASE_URL}/api/admin/stadiums`,
    COACHES: `${API_BASE_URL}/api/admin/coaches`,
  },

  // User endpoints
  USER: {
    TEAMS: `${API_BASE_URL}/api/teams`,
    TEAM_BY_ID: (teamId) => `${API_BASE_URL}/api/teams/${teamId}`,

    PLAYERS: `${API_BASE_URL}/api/players`,
    PLAYER_BY_ID: (playerId) => `${API_BASE_URL}/api/players/${playerId}`,

    LEAGUES: `${API_BASE_URL}/api/leagues`,
    LEAGUE_BY_ID: (leagueId) => `${API_BASE_URL}/api/leagues/${leagueId}`,

    STANDINGS: `${API_BASE_URL}/api/standings`,

    MATCHES: `${API_BASE_URL}/api/matches`,
    MATCH_BY_ID: (matchId) => `${API_BASE_URL}/api/matches/${matchId}`,

    TOP_SCORERS: `${API_BASE_URL}/api/top-scorers`,

    SEARCH_PLAYERS: `${API_BASE_URL}/api/search/players`,
    SEARCH_TEAMS: `${API_BASE_URL}/api/search/teams`,
    SEARCH_STADIUMS: `${API_BASE_URL}/api/search/stadiums`,
    SEARCH_COACHES: `${API_BASE_URL}/api/search/coaches`,
    SEARCH_GLOBAL: `${API_BASE_URL}/api/search`,

    SEASONS: `${API_BASE_URL}/api/seasons`,

    TEAM_STATS: (teamId) => `${API_BASE_URL}/api/statistics/team/${teamId}`,
    LEAGUE_STATS: (leagueId) =>
      `${API_BASE_URL}/api/statistics/league/${leagueId}`,
  },
};

export default API_BASE_URL;
