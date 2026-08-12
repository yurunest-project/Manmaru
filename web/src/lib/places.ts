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

function featureAddress(p: PhotonFeature["properties"]) {
  return [p.state, p.city, p.district, p.locality, p.street, p.housenumber]
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
    .join(" ");
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Destination[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // Photon は ja 非対応（default / de / en / fr のみ）。日本語クエリはそのまま送る。
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=8`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`場所の検索に失敗しました（${response.status}）`);
  }

  const json = (await response.json()) as { features?: PhotonFeature[]; lang?: unknown };
  if (!Array.isArray(json.features)) {
    throw new Error("場所の検索結果を取得できませんでした");
  }

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
