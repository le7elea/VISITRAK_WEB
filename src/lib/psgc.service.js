const PSGC_API_BASE_URL = (
  import.meta.env.VITE_PSGC_API_BASE_URL || "https://psgc.cloud/api/v2"
).replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_PSGC_TIMEOUT_MS || 8000);
const BOHOL_PROVINCE_CODE =
  import.meta.env.VITE_PSGC_BOHOL_PROVINCE_CODE || "0701200000";

const buildUrl = (path) => `${PSGC_API_BASE_URL}${path}`;

const sortNames = (items) =>
  [...items].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

const needsEncodingRepair = (text) => /[\u00C3\u00C2\u00E2\u00F0]/.test(text);

const repairMisencodedUtf8 = (text) => {
  if (!needsEncodingRepair(text)) return text;

  try {
    const bytes = Uint8Array.from(
      Array.from(text, (char) => char.charCodeAt(0) & 0xff)
    );
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return text;
  }
};

const sanitizeName = (rawName) =>
  repairMisencodedUtf8(String(rawName || "").trim());

const unwrapListResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return null;
};

const fetchJson = async (path) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`PSGC request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

export const normalizeLocalityName = (name = "") =>
  name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\bpresident\b/g, "pres")
    .replace(/\bcity\b/g, "")
    .replace(/\bmunicipality\b/g, "")
    .replace(/\bof\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const fetchBoholCitiesMunicipalities = async () => {
  let payload;

  try {
    payload = await fetchJson(
      `/provinces/${encodeURIComponent(BOHOL_PROVINCE_CODE)}/cities-municipalities`
    );
  } catch (error) {
    if (error?.status !== 404) throw error;

    payload = await fetchJson(
      `/provinces/${encodeURIComponent("Bohol")}/cities-municipalities`
    );
  }

  const rows = unwrapListResponse(payload);

  if (!rows) {
    throw new Error("Unexpected PSGC municipalities response shape");
  }

  const byName = new Map();

  rows.forEach((row) => {
    const name = sanitizeName(row?.name);
    const code = String(row?.code || "").trim();
    if (!name || !code) return;
    if (!byName.has(name)) {
      byName.set(name, code);
    }
  });

  const sortedNames = sortNames(Array.from(byName.keys()));
  return sortedNames.map((name) => ({ name, code: byName.get(name) }));
};

export const fetchBarangaysByCityMunicipalityCode = async (
  cityMunicipalityCode
) => {
  if (!cityMunicipalityCode) {
    return [];
  }

  const rows = await fetchJson(
    `/cities-municipalities/${encodeURIComponent(
      cityMunicipalityCode
    )}/barangays`
  );

  const list = unwrapListResponse(rows);

  if (!list) {
    throw new Error("Unexpected PSGC barangays response shape");
  }

  const names = list
    .map((row) => sanitizeName(row?.name))
    .filter(Boolean);

  return sortNames(Array.from(new Set(names)));
};
