import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/tontine";

const user = localStorage.getItem("userId");
// Get user's Tontine groups
export const getUserTontine = async () => {
  return axios.get(`${API_BASE_URL}/user/?userId=${user}`).then((res) => res.data);
};

// Create a new Tontine
export const createTontine = async (tontineData) => {
  return axios.post(`${API_BASE_URL}/create/?userId=${user}`, tontineData);
};

// Start a Tontine cycle
export const startTontine = async (tontineId) => {
  return axios.post(`${API_BASE_URL}/start/${tontineId}`);
};

// Invite members
export const inviteMembers = async (tontineId, members) => {
  return axios.post(`${API_BASE_URL}/invite`, { tontineId, members });
};

// Get the current cycle
export const getCycle = async (tontineId) => {
  console.log("Fetching cycle for tontineId:", tontineId); // Debug log
  return axios.get(`${API_BASE_URL}/cycle/`, { params: { tontineId } });
};


// Update a cycle
export const updateCycle = async (tontineId, updates) => {
  return axios.patch(`${API_BASE_URL}/`, { tontineId, ...updates });
};

// Get all members
export const getMembers = async (tontineId) => {
  return axios.get(`${API_BASE_URL}/member`, { params: { tontineId } });
};

// Pay into the Tontine
export const payTontine = async (tontineId, amount) => {
  return axios.post(`${API_BASE_URL}/pay/?userId=${user}`, { tontineId, amount });
};

// Collect Tontine funds
export const collectTontine = async (tontineId) => {
  return axios.post(`${API_BASE_URL}/collect`, { tontineId });
};
