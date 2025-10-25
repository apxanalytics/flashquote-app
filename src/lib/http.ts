import { createClient } from "@supabase/supabase-js";

export const supa = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Always build an ABSOLUTE same-origin URL to edge functions.
// This avoids the SPA fallback that returns index.html (your "Bad JSON (200) ..." error).
export const fn = (name: string) =>
  new URL(`/functions/v1/${name}`, window.location.origin).toString();

export async function authHeaders() {
  const { data: { session } } = await supa.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export async function fetchJSON(path: string, init: RequestInit = {}) {
  const res = await fetch(path, init);
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(`Bad JSON (${res.status}): ${text.slice(0, 200) || "<empty>"}`);
  }
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error(`Bad JSON (${res.status}): ${text}`); }
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}
