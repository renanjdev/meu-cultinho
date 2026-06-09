import { usernameToEmail, emailToUsername } from './usernames';
test('usuario vira email interno em minúsculas', () => {
  expect(usernameToEmail(' Lucas.S ')).toBe('lucas.s@meucultinho.app');
});
test('email interno volta pra usuario', () => {
  expect(emailToUsername('lucas.s@meucultinho.app')).toBe('lucas.s');
});
