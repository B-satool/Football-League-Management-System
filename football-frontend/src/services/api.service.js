import { API_ENDPOINTS } from "../config/api";

// For development - mock user ID (replace with real auth later)
const DEV_USER_ID = "1";

class ApiService {
  constructor() {
    this.headers = {
      "Content-Type": "application/json",
      "X-User-Id": DEV_USER_ID, // For development only
    };
  }

  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // GET request
  get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.request(fullUrl, { method: "GET" });
  }

  // POST request
  post(url, data) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  put(url, data) {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  delete(url) {
    return this.request(url, { method: "DELETE" });
  }

  // Set user ID for admin auth (call this after login)
  setUserId(userId) {
    this.headers["X-User-Id"] = userId;
  }
}

export default new ApiService();
