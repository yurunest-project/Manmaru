import type { Destination } from "../types";

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

export async function searchPlaces(query: string): Promise<Destination[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lang=ja&limit=8`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const json = (await response.json()) as { features?: PhotonFeature[] };

  return (json.features ?? []).map((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const p = feature.properties;
    const address = [p.housenumber, p.street, p.city, p.state, p.country]
      .filter(Boolean)
      .join(" ");
    return {
      id: crypto.randomUUID(),
      name: p.name || address || "行き先",
      address,
      latitude: lat,
      longitude: lng,
    };
  });
}
