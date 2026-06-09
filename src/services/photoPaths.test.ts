import { storagePath } from './photoPaths';
test('caminho de storage por tipo e id', () => {
  expect(storagePath('jovens', 'j1')).toBe('jovens/j1.jpg');
  expect(storagePath('auxiliares', 'uid9')).toBe('auxiliares/uid9.jpg');
});
