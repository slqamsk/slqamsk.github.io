// docs/apps/ShopList/v02/__tests__/simple.test.js
test('проверка что тесты работают', () => {
  expect(1 + 1).toBe(2);
});

test('проверка jsdom', () => {
  // Простая проверка DOM
  const div = document.createElement('div');
  div.textContent = 'test';
  expect(div.textContent).toBe('test');
});