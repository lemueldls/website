export function useReadingTime() {
  function readingTime(body: unknown): number {
    const raw = JSON.stringify(body ?? "");
    const words = raw.split(/\s+/).length;
    return Math.max(1, Math.round(words / 220));
  }

  return { readingTime };
}
