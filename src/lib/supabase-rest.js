function getRuntimeConfig() {
  return window.__APP_CONFIG__ || {};
}

function normalizeBaseUrl(url) {
  return String(url || '').replace(/\/$/, '');
}

export function isRemoteSharingConfigured() {
  const { supabaseUrl, supabaseAnonKey } = getRuntimeConfig();
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function buildHeaders() {
  const { supabaseAnonKey } = getRuntimeConfig();
  return {
    'Content-Type': 'application/json',
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  };
}

export async function createSharedRecord(snapshot) {
  const { supabaseUrl } = getRuntimeConfig();
  const baseUrl = normalizeBaseUrl(supabaseUrl);
  if (!baseUrl) {
    throw new Error('Supabase не настроен: отсутствует supabaseUrl.');
  }

  const response = await fetch(`${baseUrl}/rest/v1/shared_calculations`, {
    method: 'POST',
    headers: {
      ...buildHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      schema_version: snapshot.schemaVersion,
      app_name: snapshot.appName,
      payload: snapshot,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Не удалось сохранить shared-расчёт: ${text || response.status}`);
  }

  const payload = await response.json();
  return payload[0];
}

export async function fetchSharedRecord(id) {
  const { supabaseUrl } = getRuntimeConfig();
  const baseUrl = normalizeBaseUrl(supabaseUrl);
  if (!baseUrl) {
    throw new Error('Supabase не настроен: отсутствует supabaseUrl.');
  }

  const response = await fetch(
    `${baseUrl}/rest/v1/shared_calculations?select=id,created_at,schema_version,app_name,payload&id=eq.${encodeURIComponent(id)}&limit=1`,
    {
      method: 'GET',
      headers: buildHeaders(),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Не удалось загрузить shared-расчёт: ${text || response.status}`);
  }

  const rows = await response.json();
  return rows[0] ?? null;
}
