import { createError, getCookie, setCookie } from "h3";

import type { VisitCounts } from "#shared/visits";

const COOKIE = "visit";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

function dayOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default defineEventHandler(async (event) => {
  const day = dayOf(new Date());
  const storage = useStorage("views");
  const alreadyCounted = getCookie(event, COOKIE) === day;

  try {
    const [storedTotal, storedToday, storedSince] = await Promise.all([
      storage.getItem<number>("total"),
      storage.getItem<number>(`day:${day}`),
      storage.getItem<string>("since"),
    ]);

    const counts: VisitCounts = {
      total: storedTotal ?? 0,
      today: storedToday ?? 0,
      since: storedSince ?? day,
    };

    if (!alreadyCounted) {
      counts.total += 1;
      counts.today += 1;

      await Promise.all([
        storage.setItem("total", counts.total),
        storage.setItem(`day:${day}`, counts.today),

        storedSince ? undefined : storage.setItem("since", counts.since),
      ]);

      setCookie(event, COOKIE, day, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }

    setHeader(event, "cache-control", "no-store");

    return counts;
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: "The visitor counter is temporarily unavailable",
      cause: error,
    });
  }
});
