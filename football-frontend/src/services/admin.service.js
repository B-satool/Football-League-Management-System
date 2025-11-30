import apiService from "./api.service";
import { API_ENDPOINTS } from "../config/api";

export const adminService = {
  // User management
  getAllUsers: () => {
    return apiService.get(API_ENDPOINTS.ADMIN.USERS);
  },

  updateUserPrivilege: (userId, isAdmin) => {
    return apiService.put(API_ENDPOINTS.ADMIN.USER_PRIVILEGE(userId), {
      is_admin: isAdmin ? 1 : 0,
    });
  },

  getAuditLog: () => {
    return apiService.get(API_ENDPOINTS.ADMIN.AUDIT_LOG);
  },

  // Reference data
  getLeagues: () => {
    return apiService.get(API_ENDPOINTS.ADMIN.LEAGUES);
  },

  getSeasons: () => {
    return apiService.get(API_ENDPOINTS.ADMIN.SEASONS);
  },

  getStadiums: () => {
    return apiService.get(API_ENDPOINTS.ADMIN.STADIUMS);
  },

  getCoaches: () => {
    return apiService.get(API_ENDPOINTS.ADMIN.COACHES);
  },
};
