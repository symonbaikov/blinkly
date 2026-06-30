export function msUntilNextLocalDay(now = new Date()): number {
  const nextLocalMidnight = new Date(now);
  nextLocalMidnight.setHours(24, 0, 0, 0);

  return Math.max(0, nextLocalMidnight.getTime() - now.getTime());
}
