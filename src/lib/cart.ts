// Cart logic — shape + persistence + totals.
//
// Lives entirely client-side for now (localStorage). When auth lands in
// Fatia 3, the same shape gets persisted to D1 via /api/cart.

import { MXN_RATE } from "./mock";

export interface CartItem {
  /** Stable id so React keys + 'remove from cart' work; product+variant hash. */
  lineId: string;

  // Photo + event
  photoId: number;
  photoTimestamp: string;        // "21:34"
  photoImage: string;            // URL
  photoTile: string;             // brand color, bg if image fails
  photographer: string;
  eventCode: string;             // "BB-001"
  eventName: string;

  // Product
  productSku: "digital" | "print" | "tshirt" | "mug" | "canvas";
  size: string | null;
  color: string | null;
  qty: number;

  // Pricing
  unitPriceUSD: number;
  fulfillment: number | "instant";

  addedAt: number;
}

const STORAGE_KEY = "fs:cart:v1";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: JSON.stringify(items) }));
  } catch { /* quota etc. */ }
}

export function clearCart(): void { saveCart([]); }

export function makeLineId(parts: {
  photoId: number;
  productSku: string;
  size: string | null;
  color: string | null;
}): string {
  return [parts.productSku, parts.photoId, parts.size ?? "-", parts.color ?? "-"].join("|");
}

export function addToCart(cart: CartItem[], item: CartItem): CartItem[] {
  const existing = cart.find((c) => c.lineId === item.lineId);
  if (existing) {
    return cart.map((c) => c.lineId === item.lineId ? { ...c, qty: c.qty + item.qty } : c);
  }
  return [...cart, item];
}

export function updateQty(cart: CartItem[], lineId: string, qty: number): CartItem[] {
  if (qty <= 0) return removeLine(cart, lineId);
  return cart.map((c) => c.lineId === lineId ? { ...c, qty } : c);
}

export function removeLine(cart: CartItem[], lineId: string): CartItem[] {
  return cart.filter((c) => c.lineId !== lineId);
}

const IVA_RATE = 0.16;

export interface CartTotals {
  subtotalMXN: number;
  ivaMXN: number;
  totalMXN: number;
  totalItems: number;
  hasPhysical: boolean;
  hasDigital: boolean;
}

export function computeTotals(cart: CartItem[]): CartTotals {
  let subtotalMXN = 0;
  let totalItems = 0;
  let hasPhysical = false;
  let hasDigital = false;
  for (const item of cart) {
    subtotalMXN += item.unitPriceUSD * MXN_RATE * item.qty;
    totalItems += item.qty;
    if (item.fulfillment === "instant") hasDigital = true;
    else hasPhysical = true;
  }
  const ivaMXN = Math.round(subtotalMXN * IVA_RATE);
  return {
    subtotalMXN: Math.round(subtotalMXN),
    ivaMXN,
    totalMXN: Math.round(subtotalMXN) + ivaMXN,
    totalItems,
    hasPhysical,
    hasDigital,
  };
}

export function formatMXN(n: number): string {
  return `$${n.toLocaleString("es-MX", { maximumFractionDigits: 0 })} MXN`;
}

export function newOrderNumber(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `FS-${yy}-${mm}-${rand}`;
}

export function newOxxoReference(): string {
  let out = "";
  for (let i = 0; i < 13; i++) out += Math.floor(Math.random() * 10);
  return out.replace(/(\d{4})(\d{4})(\d{5})/, "$1 $2 $3");
}

// ── Placed orders ───────────────────────────────────────────────────────────
//
// Until accounts + D1 land (Fatia 3), placed orders are kept in localStorage
// on the buying device. This is what powers /fansnap/pedidos — a fan who
// closed the confirmation tab can recover the order on the same device with
// order number + email. A real server-side lookup replaces this later.

export interface PlacedOrder {
  number: string;
  email: string;
  oxxoReference: string | null;
  items: CartItem[];
  placedAt: number; // epoch ms
}

const ORDERS_KEY = "fs:orders:v1";

export function loadOrders(): PlacedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PlacedOrder[];
  } catch {
    return [];
  }
}

/** Persist a newly placed order (most-recent first). */
export function saveOrder(order: PlacedOrder): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadOrders().filter((o) => o.number !== order.number);
    const next = [order, ...existing].slice(0, 50); // cap history
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
  } catch { /* quota etc. */ }
}

/** Look up an order by number + email (both required, case-insensitive on
 *  email). Returns null when no local match — the caller shows a friendly
 *  "not found on this device" message. */
export function findOrder(orderNumber: string, email: string): PlacedOrder | null {
  const num = orderNumber.trim().toUpperCase();
  const mail = email.trim().toLowerCase();
  if (!num || !mail) return null;
  return (
    loadOrders().find(
      (o) => o.number.toUpperCase() === num && o.email.toLowerCase() === mail,
    ) ?? null
  );
}
