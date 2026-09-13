/** Parse admin date/time strings (ISO or datetime-local). */
export function parseDateTime(value?: string): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value.trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

/** True when `yes`, `true`, or `1`. */
export function isSettingEnabled(value?: string): boolean {
  const v = value?.trim().toLowerCase();
  return v === "yes" || v === "true" || v === "1";
}

/** Empty start/end means no limit on that side. */
export function isWithinSchedule(
  start?: string,
  end?: string,
  now: Date = new Date()
): boolean {
  const startDate = parseDateTime(start);
  const endDate = parseDateTime(end);
  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;
  return true;
}

export function remainingMs(
  target?: string,
  now: Date = new Date()
): number | null {
  const end = parseDateTime(target);
  if (!end) return null;
  return Math.max(0, end.getTime() - now.getTime());
}

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

export function countdownParts(
  target?: string,
  now: Date = new Date()
): CountdownParts | null {
  const end = parseDateTime(target);
  if (!end) return null;
  const ms = end.getTime() - now.getTime();
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, expired: false };
}

/** Format ISO for `<input type="datetime-local" />`. */
export function toDateTimeLocalValue(value?: string): string {
  const d = parseDateTime(value);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
