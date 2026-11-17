const OFFSET_MS = 7 * 3600 * 1000;

export function toSlotId(date, hour) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Date must use YYYY-MM-DD format.");
  if (!/^(?:[01]?\d|2[0-3])$/.test(String(hour))) throw new Error("Choose a whole hour from 0 to 23.");
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(0);
  value.setUTCFullYear(year, month - 1, day);
  value.setUTCHours(Number(hour), 0, 0, 0);
  if (year < 1 || value.getUTCFullYear() !== year || value.getUTCMonth() !== month - 1 || value.getUTCDate() !== day) throw new Error("Invalid calendar date.");
  const seconds = (value.getTime() - OFFSET_MS) / 1000;
  if (!Number.isSafeInteger(seconds) || seconds <= 0 || seconds % 3600 !== 0) throw new Error("Time slots must start on the hour and have a positive slot ID.");
  return BigInt(seconds / 3600);
}

export function fromSlotId(slotId) {
  if (!/^\d+$/.test(String(slotId))) throw new Error("Slot ID must be a positive whole number.");
  const id = BigInt(slotId);
  const milliseconds = Number(id * 3600n * 1000n + BigInt(OFFSET_MS));
  if (id <= 0n || !Number.isSafeInteger(milliseconds)) throw new Error("Slot ID is outside the supported date range.");
  const date = new Date(milliseconds);
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() > 9999) throw new Error("Slot ID is outside the supported date range.");
  return { date: date.toISOString().slice(0, 10), hour: date.getUTCHours() };
}

export function slotLabel(slotId) {
  const start = fromSlotId(slotId), end = fromSlotId(BigInt(slotId) + 1n);
  const hour = n => String(n).padStart(2, "0") + ":00";
  return `${start.date} · ${hour(start.hour)}–${hour(end.hour)}${end.date !== start.date ? " (next day)" : ""} · UTC+07:00`;
}

export function vietnamToday(now = new Date()) {
  return new Date(now.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}
