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

/** Parse CMS yes/no toggles; uses default when unset. */
export function parseYesNoSetting(value: string | undefined, defaultValue: boolean): boolean {
  const v = value?.trim().toLowerCase();
  if (v === "no" || v === "false" || v === "0") return false;
  if (v === "yes" || v === "true" || v === "1") return true;
  return defaultValue;
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

export type CountdownPhase = "before" | "active" | "expired";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  phase: CountdownPhase;
};

function msToParts(ms: number, phase: CountdownPhase): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: phase === "expired",
    phase,
  };
}

/** Count down to start (before), then to end (active), then expired. */
export function countdownParts(
  endAt?: string,
  startAt?: string,
  now: Date = new Date()
): CountdownParts | null {
  const end = parseDateTime(endAt);
  if (!end) return null;
  const start = parseDateTime(startAt);

  if (start && now < start) {
    return msToParts(start.getTime() - now.getTime(), "before");
  }

  const ms = end.getTime() - now.getTime();
  if (ms <= 0) {
    return msToParts(0, "expired");
  }

  return msToParts(ms, "active");
}

/** Format ISO for `<input type="datetime-local" />`. */
export function toDateTimeLocalValue(value?: string): string {
  const d = parseDateTime(value);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
