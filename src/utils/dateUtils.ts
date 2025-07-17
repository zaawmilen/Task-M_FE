// Returns true if the given date is in the future (compared to now)
export function isFutureDate(date: Date): boolean {
  return date.getTime() > Date.now();
}