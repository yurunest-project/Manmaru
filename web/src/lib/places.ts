import type { Destination } from "../types";

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    locality?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
};

const SEARCH_TIMEOUT_MS = 8000;
/** 東京付近にバイアス（日本の結果を優先しやすくする） */
const JP_LAT = 35.6812;
const JP_LON = 139.7671;

function featureAddress(p: PhotonFeature["properties"]) {
  return [p.state, p.city, p.district, p.locality, p.street, p.housenumber]
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
    .join(" ");
}

async function fetchWithTimeout(url: string, signal?: AbortSignal, init?: RequestInit) {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);
  const timer = window.setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

async function searchPhoton(query: string, signal?: AbortSignal): Promise<Destination[]> {
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}` +
    `&lat=${JP_LAT}&lon=${JP_LON}&limit=8`;
  const response = await fetchWithTimeout(url, signal);
  if (!response.ok) throw new Error(`photon:${response.status}`);
  const json = (await response.json()) as { features?: PhotonFeature[] };
  if (!Array.isArray(json.features)) throw new Error("photon:invalid");

  return json.features.map((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const p = feature.properties;
    const address = featureAddress(p);
    return {
      id: crypto.randomUUID(),
      name: p.name || address || "行き先",
      address,
      latitude: lat,
      longitude: lng,
    };
  });
}

async function searchNominatim(query: string, signal?: AbortSignal): Promise<Destination[]> {
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}` +
    `&limit=8&countrycodes=jp&accept-language=ja`;
  const response = await fetchWithTimeout(url, signal, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`nominatim:${response.status}`);
  const json = (await response.json()) as NominatimResult[];
  if (!Array.isArray(json)) throw new Error("nominatim:invalid");

  return json.map((item) => {
    const name = item.name || item.display_name.split(",")[0]?.trim() || "行き先";
    return {
      id: `nominatim-${item.place_id}`,
      name,
      address: item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    };
  });
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Destination[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const photon = await searchPhoton(trimmed, signal);
    if (photon.length > 0) return photon;
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") throw err;
  }

  try {
    return await searchNominatim(trimmed, signal);
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") throw err;
    throw new Error(
      "場所の検索が混み合っています。少し待つか、下のボタンで名前を追加してください。",
    );
  }
}
