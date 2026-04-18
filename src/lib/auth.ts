export const AUTH_STORAGE_KEY = "resqmeal_session";
const LEGACY_AUTH_STORAGE_KEYS = ["supabase.auth.token", "resqmeal_user", "resqmeal_auth"];

export const AUTH_ROLES = ["donor", "ngo", "volunteer"] as const;
export type UserRole = (typeof AUTH_ROLES)[number];

export type AuthSession = {
  user_id: string;
  email: string;
  role: UserRole;
  token: string;
};

function isValidRole(role: unknown): role is UserRole {
  return typeof role === "string" && AUTH_ROLES.includes(role as UserRole);
}

function parseJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded)) as { exp?: number };
    return decoded;
  } catch {
    return null;
  }
}

export function isValidToken(token: unknown) {
  if (typeof token !== "string" || token.trim().length < 10) {
    return false;
  }

  const payload = parseJwtPayload(token);
  if (payload?.exp && Date.now() >= payload.exp * 1000) {
    return false;
  }

  return true;
}

export function buildFallbackToken(sessionSeed: Pick<AuthSession, "user_id" | "email" | "role">) {
  return btoa(`${sessionSeed.user_id}:${sessionSeed.email}:${sessionSeed.role}:${Date.now()}`);
}

export function resolveSessionToken(
  authResponse: Partial<{ token: string; access_token: string; jwt: string }>,
  fallbackSeed: Pick<AuthSession, "user_id" | "email" | "role">,
) {
  const candidate = authResponse.token || authResponse.access_token || authResponse.jwt;
  return isValidToken(candidate) ? candidate : buildFallbackToken(fallbackSeed);
}

export function getDashboardRoute(role: UserRole) {
  if (role === "donor") {
    return "/donate";
  }

  if (role === "ngo") {
    return "/ngo";
  }

  return "/tracking";
}

function clearStorageKey(key: string) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

function clearLegacyAuthStorage() {
  LEGACY_AUTH_STORAGE_KEYS.forEach((key) => clearStorageKey(key));

  const localKeys = Object.keys(localStorage);
  localKeys.forEach((key) => {
    if (key.startsWith("sb-") || key.toLowerCase().includes("supabase")) {
      localStorage.removeItem(key);
    }
  });

  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach((key) => {
    if (key.startsWith("sb-") || key.toLowerCase().includes("supabase")) {
      sessionStorage.removeItem(key);
    }
  });
}

export function getUserLabel(email: string) {
  const localPart = email.split("@")[0] || "user";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    clearLegacyAuthStorage();
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      typeof parsed.user_id !== "string" ||
      typeof parsed.email !== "string" ||
      !isValidRole(parsed.role) ||
      !isValidToken(parsed.token)
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsed as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }
  if (!isValidRole(session.role) || !isValidToken(session.token)) {
    clearStoredSession();
    return;
  }

  clearLegacyAuthStorage();

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
