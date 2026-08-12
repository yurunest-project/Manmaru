import type { Destination } from "../types";

export function openDrivingRoute(destination: Destination) {
  const hasCoords = destination.latitude !== 0 || destination.longitude !== 0;
  const target = hasCoords
    ? `${destination.latitude},${destination.longitude}`
    : `${destination.name} ${destination.address}`.trim();
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}&travelmode=driving`;
  window.open(url, "_blank", "noopener,noreferrer");
}
