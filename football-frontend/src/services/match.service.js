import apiService from "./api.service";
import { API_ENDPOINTS } from "../config/api";

export const matchService = {
  // User endpoints
  getAllMatches: (params = {}) => {
    return apiService.get(API_ENDPOINTS.USER.MATCHES, params);
  },

  getMatchById: (matchId) => {
    return apiService.get(API_ENDPOINTS.USER.MATCH_BY_ID(matchId));
  },

  // Admin endpoints
  scheduleMatch: (matchData) => {
    return apiService.post(API_ENDPOINTS.ADMIN.MATCHES, matchData);
  },

  updateMatch: (matchId, matchData) => {
    return apiService.put(API_ENDPOINTS.ADMIN.MATCH_BY_ID(matchId), matchData);
  },

  deleteMatch: (matchId) => {
    return apiService.delete(API_ENDPOINTS.ADMIN.MATCH_BY_ID(matchId));
  },

  updateScore: (matchId, scoreData) => {
    return apiService.put(API_ENDPOINTS.ADMIN.MATCH_SCORE(matchId), scoreData);
  },
};
