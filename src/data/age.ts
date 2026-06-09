export function ageFrom(birth: string, now: Date = new Date()): number {
  const [d, m, y] = birth.split('/').map(Number);
  if (!d || !m || !y) return 0;
  const age = now.getFullYear() - y;
  const before = now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d);
  return before ? age - 1 : age;
}
