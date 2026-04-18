import axios from "axios";

export const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: FLASK_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
