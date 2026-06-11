import { z } from "zod";

const API_BASE = "/api/integrations";

async function fetchJSON<T>(path: string, init: RequestInit = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return (await res.json()) as T;
}

const saveIntegrationSchema = z.object({
  sheet_url: z.string().url().or(z.literal("")),
  sheet_name: z.string().min(1).max(120),
  header_row: z.number().int().min(1).max(50),
  auto_sync_enabled: z.boolean(),
  sync_frequency_minutes: z.number().int().min(1).max(60).optional(),
  column_mapping: z.record(z.string(), z.string()).optional(),
});

export async function getIntegration() {
  return fetchJSON<{ integration: any; diagnostics: any }>(`${API_BASE}`);
}

export async function saveIntegration(data: unknown) {
  const payload = saveIntegrationSchema.parse(data);
  return fetchJSON<{ integration: any; diagnostics: any }>(`${API_BASE}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function detectHeaders(payload: unknown = {}) {
  return fetchJSON<{ headers: string[]; suggested: Record<string, string>; diagnostics: any }>(`${API_BASE}/detect`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function triggerSync(data: { fullHistory?: boolean } = {}) {
  return fetchJSON<{ created?: number; updated?: number; skipped?: number; diagnostics?: any; errors?: any }>(
    `${API_BASE}/sync`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function getSyncLogs() {
  return fetchJSON<any[]>(`${API_BASE}/logs`);
}