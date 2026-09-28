// Utility functions for RE:USE platform

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers (rounded to 1 decimal place)
 */
export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Format currency in Indian Rupees format (₹)
 */
export function formatPrice(amount: number): string {
  if (amount <= 0) return "FREE";
  return `₹${amount.toLocaleString("en-IN")}/day`;
}

/**
 * Format distance with friendly suffix
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

/**
 * Calculate time overlap percentage between a seeker need window and resource availability window
 * e.g., need: 12:00 to 15:00 (3 hours), available: 10:00 to 18:00
 */
export function getTimeOverlap(
  needFrom: string,
  needTo: string,
  resFrom: string,
  resTo: string
): number {
  // Convert "HH:MM" or "10:00" to minutes from midnight
  const parseMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    // Check if ISO date string
    if (timeStr.includes("T")) {
      const date = new Date(timeStr);
      return date.getHours() * 60 + date.getMinutes();
    }
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const needStart = parseMinutes(needFrom);
  const needEnd = parseMinutes(needTo);
  const resStart = parseMinutes(resFrom);
  const resEnd = parseMinutes(resTo);

  const needDuration = Math.max(1, needEnd - needStart);

  // Overlap interval
  const overlapStart = Math.max(needStart, resStart);
  const overlapEnd = Math.min(needEnd, resEnd);

  if (overlapEnd <= overlapStart) {
    return 0; // No overlap
  }

  const overlapDuration = overlapEnd - overlapStart;
  const percentage = Math.min(100, Math.round((overlapDuration / needDuration) * 100));
  return percentage;
}

/**
 * Format date string into human readable display
 */
export function formatDate(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return timestamp;
  }
}

/**
 * Combine CSS classes cleanly
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}
