import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Sends a request to register a new user.
 * @param {object} userData - The user's data.
 * @param {string} userData.username - The desired username.
 * @param {string} userData.email - The user's email address.
 * @param {string} userData.password - The user's password.
 * @returns {Promise} An Axios promise with the response.
 */
export const registerUser = (userData) => {
  return apiClient.post("/auth/register", userData);
};

/**
 * Sends a request to log in a user.
 * @param {object} credentials - The user's login credentials.
 * @param {string} credentials.username - The username to log in with.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise} An Axios promise with the response.
 */
export const loginUser = (credentials) => {
  return apiClient.post("/auth/login", credentials);
};

/**
 * Fetches the current user's profile information.
 * Requires a valid access token.
 * @param {string} token - The user's JWT access token.
 * @returns {Promise} An Axios promise with the response.
 */
export const getProfile = (token) => {
  return apiClient.get("/auth/profile", {});
};

/**
 * Sends a request to log out a user by invalidating their refresh token.
 * @param {string} refreshToken - The user's JWT refresh token.
 * @returns {Promise} An Axios promise with the response.
 */
export const logoutUser = (refreshToken) => {
  return apiClient.post("/auth/logout", { refresh_token: refreshToken });
};

/**
 * Sends a request to get a new access token using a refresh token.
 * @param {string} refreshToken - The user's JWT refresh token.
 * @returns {Promise} An Axios promise with the response.
 */
export const refreshToken = (refreshToken) => {
  return apiClient.post("/auth/refresh", { refresh_token: refreshToken });
};

/**
 * Fetches credentials for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The user's JWT access token.
 * @returns {Promise} An Axios promise with the response.
 */
/*
export const getCredentials = (userId, token) => {
  return apiClient.get(`/users/${userId}/credentials`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
*/

/**
 * Fetches all workflows for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The user's JWT access token.
 * @returns {Promise} An Axios promise with the list of workflows.
 */
export const getWorkflows = (userId, token) => {
  return apiClient.get(`/workflows`, {});
};

/**
 * Creates a new workflow for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The user's JWT access token.
 * @param {object} workflowData - Optional data for the new workflow, e.g., { name: 'My New Flow' }.
 * @returns {Promise} An Axios promise with the newly created workflow object.
 */
export const createWorkflow = (userId, token, workflowData = {}) => {
  return apiClient.post(`/users/${userId}/workflows`, workflowData, {});
};

export const getWorkflowById = (userId, workflowId, token) => {
  return apiClient.get(`/users/${userId}/workflows/${workflowId}`, {});
};

export const updateWorkflow = (userId, workflowId, workflowData, token) => {
  return apiClient.put(
    `/users/${userId}/workflows/${workflowId}`,
    workflowData,
  );
};

export const executeWorkflow = (userId, workflowId, token) => {
  return apiClient.post(`/users/${userId}/workflows/${workflowId}/execute`, {});
};

/**
 * Fetches the profile statistics for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The user's JWT access token.
 * @returns {Promise} An Axios promise with the profile stats.
 */
export const getProfileStats = (userId, token) => {
  return apiClient.get(`/users/${userId}/profile-stats`);
};

/**
 * Fetches the dashboard data for the user.
 * @param {string} token - The user's JWT access token.
 * @returns {Promise} An Axios promise with the dashboard data.
 */
export const getDashboardData = (token) => {
  return apiClient.get("/dashboard", {});
};
