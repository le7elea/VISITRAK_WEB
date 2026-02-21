const PSGC_API_BASE_URL = (
  import.meta.env.VITE_PSGC_API_BASE_URL || "https://psgc.cloud/api/v2"
).replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_PSGC_TIMEOUT_MS || 8000);
const BOHOL_PROVINCE_CODE = "0712";

const buildUrl = (path) => `${PSGC_API_BASE_URL}${path}`;

const sortNames = (items) =>
  [...items].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

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
      throw new Error(`PSGC request failed (${response.status})`);
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
  const rows = await fetchJson(
    `/provinces/${BOHOL_PROVINCE_CODE}/cities-municipalities`
  );

  if (!Array.isArray(rows)) {
    throw new Error("Unexpected PSGC municipalities response shape");
  }

  const byName = new Map();

  rows.forEach((row) => {
    const name = String(row?.name || "").trim();
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

  if (!Array.isArray(rows)) {
    throw new Error("Unexpected PSGC barangays response shape");
  }

  const names = rows
    .map((row) => String(row?.name || "").trim())
    .filter(Boolean);

  return sortNames(Array.from(new Set(names)));
};
