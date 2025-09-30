import React from "react";

export function formatPrice(amount?: number | null): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export function formatArea(sqm?: number | null): string {
  if (typeof sqm !== "number" || !Number.isFinite(sqm)) return "-";
  return `${sqm} m²`;
}

export function formatYear(year?: number | null): string {
  if (typeof year !== "number" || !Number.isFinite(year)) return "-";
  return `${year} г.`;
}

export function isNewProperty(createdAt?: string | null): boolean {
  if (!createdAt) return false;
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;
  const diffDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  return diffDays < 7;
}

export function formatFloor(floor?: number | null, totalFloors?: number | null): string {
  if (typeof floor !== "number" || !Number.isFinite(floor)) return "-";
  if (typeof totalFloors === "number" && Number.isFinite(totalFloors)) {
    return `${floor} / ${totalFloors}`;
  }
  return `${floor}`;
}


