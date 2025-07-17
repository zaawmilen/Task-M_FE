// Example utility function test

// Suppose you have a utility like this in src/utils/dateUtils.ts:
// export function isFutureDate(date: Date): boolean {
//   return date.getTime() > Date.now();
// }

import { isFutureDate } from '../../src/utils/dateUtils';

test('returns true for a future date', () => {
  const future = new Date(Date.now() + 10000);
  expect(isFutureDate(future)).toBe(true);
});

test('returns false for a past date', () => {
  const past = new Date(Date.now() - 10000);
  expect(isFutureDate(past)).toBe(false);
});