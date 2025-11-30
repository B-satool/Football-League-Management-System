import apiService from "./api.service";
import { API_ENDPOINTS } from "../config/api";

export const teamService = {
  // User endpoints
  getAllTeams: (params = {}) => {
    return apiService.get(API_ENDPOINTS.USER.TEAMS, params);
  },

  getTeamById: (teamId) => {
    return apiService.get(API_ENDPOINTS.USER.TEAM_BY_ID(teamId));
  },

  getTeamStats: (teamId, params = {}) => {
    return apiService.get(API_ENDPOINTS.USER.TEAM_STATS(teamId), params);
  },

  // Admin endpoints
  addTeam: (teamData) => {
    return apiService.post(API_ENDPOINTS.ADMIN.TEAMS, teamData);
  },

  updateTeam: (teamId, teamData) => {
    return apiService.put(API_ENDPOINTS.ADMIN.TEAM_BY_ID(teamId), teamData);
  },

  deleteTeam: (teamId) => {
    return apiService.delete(API_ENDPOINTS.ADMIN.TEAM_BY_ID(teamId));
  },
};
