import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api';

export const leagueService = {
  getAllLeagues: () => {
    return apiService.get(API_ENDPOINTS.USER.LEAGUES);
  },

  getLeagueById: (leagueId, params = {}) => {
    return apiService.get(API_ENDPOINTS.USER.LEAGUE_BY_ID(leagueId), params);
  },

  getStandings: (params = {}) => {
    return apiService.get(API_ENDPOINTS.USER.STANDINGS, params);
  },

  getLeagueStats: (leagueId, params = {}) => {
    return apiService.get(API_ENDPOINTS.USER.LEAGUE_STATS(leagueId), params);
  },

  getTopScorers: (params = {}) => {
    return apiService.get(API_ENDPOINTS.USER.TOP_SCORERS, params);
  },

  // Admin
  recomputeStandings: (leagueId, seasonId) => {
    return apiService.post(API_ENDPOINTS.ADMIN.RECOMPUTE_STANDINGS, {
      league_id: leagueId,
      season_id: seasonId,
    });
  },
};