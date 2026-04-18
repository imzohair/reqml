import axios from "axios";
import API_BASE from "@/lib/api-config";
import type { UserRole } from "@/lib/auth";

export const FLASK_API_URL = API_BASE;

export type AuthApiPayload = {
  email: string;
  password: string;
  role: UserRole;
};

export type AuthApiResponse = {
  user_id: string;
  email: string;
  role: UserRole;
  message?: string;
};

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
};

function extractErrorMessage(payload: unknown, fallbackMessage: string) {
  if (!payload || typeof payload !== "object") {
    return fallbackMessage;
  }

  const data = payload as { error?: unknown; message?: unknown };
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  return fallbackMessage;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new Error("Unable to reach the server right now. Please try again in a moment.");
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, "Server error"));
  }

  return payload as T;
}

export async function signupRequest(payload: AuthApiPayload) {
  return apiRequest<AuthApiResponse>("/auth/signup", {
    method: "POST",
    body: payload,
  });
}

export async function loginRequest(payload: AuthApiPayload) {
  return apiRequest<AuthApiResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});
