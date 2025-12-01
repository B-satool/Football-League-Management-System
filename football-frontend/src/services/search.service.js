import apiService from "./api.service";
import { API_ENDPOINTS } from "../config/api";

export const searchService = {
  searchPlayers: (searchTerm) => {
    return apiService.get(API_ENDPOINTS.USER.SEARCH_PLAYERS, { q: searchTerm });
  },

  searchTeams: (searchTerm) => {
    return apiService.get(API_ENDPOINTS.USER.SEARCH_TEAMS, { q: searchTerm });
  },

  searchStadiums: (searchTerm) => {
    return apiService.get(API_ENDPOINTS.USER.SEARCH_STADIUMS, {
      q: searchTerm,
    });
  },

  searchCoaches: (searchTerm) => {
    return apiService.get(API_ENDPOINTS.USER.SEARCH_COACHES, { q: searchTerm });
  },

  globalSearch: (searchTerm) => {
    return apiService.get(API_ENDPOINTS.USER.SEARCH_GLOBAL, { q: searchTerm });
  },
};
