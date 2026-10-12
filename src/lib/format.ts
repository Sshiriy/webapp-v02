const longDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const shortDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  month: "short",
  day: "numeric",
});

export function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function asDate(iso: string) {
  const value = iso.length === 10 ? `${iso}T12:00:00` : iso;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatFa(iso: string) {
  const date = asDate(iso);
  return date ? longDate.format(date) : iso;
}

export function formatFaShort(iso: string) {
  const date = asDate(iso);
  return date ? shortDate.format(date) : iso;
}

export function daysUntil(iso: string) {
  const date = asDate(iso);
  if (!date) return null;
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((date.getTime() - now.getTime()) / 86_400_000);
}

export function relativeDay(iso: string) {
  const days = daysUntil(iso);
  if (days === null) return "";
  if (days === 0) return "امروز";
  if (days === 1) return "فردا";
  if (days === -1) return "دیروز";
  if (days > 1) return `${new Intl.NumberFormat("fa-IR").format(days)} روز دیگر`;
  return `${new Intl.NumberFormat("fa-IR").format(Math.abs(days))} روز پیش`;
}

export function faNum(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export function safeTel(phone: string) {
  const trimmed = phone.trim();
  if (!/^[0-9+][0-9+\-\s]{6,}$/.test(trimmed)) return null;
  return `tel:${trimmed.replace(/[\s-]/g, "")}`;
}
