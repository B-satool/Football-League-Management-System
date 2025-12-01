import apiService from "./api.service";
import { API_ENDPOINTS } from "../config/api";

export const playerService = {
  // User endpoints
  getAllPlayers: (params = {}) => {
    return apiService.get(API_ENDPOINTS.USER.PLAYERS, params);
  },

  getPlayerById: (playerId) => {
    return apiService.get(API_ENDPOINTS.USER.PLAYER_BY_ID(playerId));
  },

  // Admin endpoints
  addPlayer: (playerData) => {
    return apiService.post(API_ENDPOINTS.ADMIN.PLAYERS, playerData);
  },

  updatePlayer: (playerId, playerData) => {
    return apiService.put(
      API_ENDPOINTS.ADMIN.PLAYER_BY_ID(playerId),
      playerData
    );
  },

  deletePlayer: (playerId) => {
    return apiService.delete(API_ENDPOINTS.ADMIN.PLAYER_BY_ID(playerId));
  },
};
