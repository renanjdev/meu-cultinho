import { ageFrom } from './age';
test('idade a partir de dd/mm/aaaa', () => {
  expect(ageFrom('14/03/2020', new Date('2026-06-09'))).toBe(6);
  expect(ageFrom('10/12/2020', new Date('2026-06-09'))).toBe(5);
});
