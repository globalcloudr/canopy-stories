"use client";

import { supabase } from "@/lib/supabase-client";

async function resolveAccessToken() {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    return data.session.access_token;
  }

  return new Promise<string | null>((resolve) => {
    const timeout = window.setTimeout(() => {
      subscription.unsubscribe();
      resolve(null);
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        window.clearTimeout(timeout);
        subscription.unsubscribe();
        resolve(session.access_token);
      }
    });
  });
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const accessToken = await resolveAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

export async function apiFetchArray<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T[]> {
  const response = await apiFetch(input, init);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as unknown;
  return Array.isArray(data) ? (data as T[]) : [];
}
