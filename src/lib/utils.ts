export { cn } from "cn";
import type { LoginSchema } from "@/services/auth/types/auth";
import { isTokenExpired } from "./auth";

export const SESSION_KEY =
  import.meta.env.VITE_SESSION_KEY_GENERATE_SECRET || "AUTH_GPSI_SOTERIA_SESSION";

function encodeSession(data: any): string {
  try {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
  } catch {
    return JSON.stringify(data);
  }
}

function decodeSession(str: string): any | null {
  try {
    const json = decodeURIComponent(atob(str));
    return JSON.parse(json);
  } catch {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }
}

export function setSession(data: LoginSchema): void {
  try {
    localStorage.setItem(SESSION_KEY, encodeSession(data));
  } catch (e) {
    console.error("setSession failed", e);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function logoutAndRedirect(): void {
  clearSession();
  window.location.replace("/auth/login");
}

export function getSession(): LoginSchema | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const storedAuth = decodeSession(raw) as LoginSchema | null;
    if (!storedAuth) return null;

    if (storedAuth.token && isTokenExpired(storedAuth.token)) {
      clearSession();
      return null;
    }
    return storedAuth;
  } catch {
    return null;
  }
}

export function getCurrentUserId(): string | null {
  const session = getSession();
  if (session?.id) return session.id;
  if (!session?.token) return null;
  try {
    const rawToken = session.token.replace(/^Bearer\s+/i, "");
    const parts = rawToken.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.id || parsed.data?.id || parsed.sub || null;
  } catch {
    return null;
  }
}

export function getPublicAssetUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseUrl = (
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3005/api/soteria/v1"
  ).replace(/\/api\/.*$/, "");
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}