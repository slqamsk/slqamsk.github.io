// docs/apps/ShopList/v02/__tests__/shared.test.js

// Мокаем DOM методы чтобы избежать выполнения DOMContentLoaded
document.addEventListener = jest.fn();

// Просто проверяем что файл загружается без ошибок
test('shared.js загружается без ошибок', () => {
  // Если не будет ошибок - значит файл корректный
  expect(() => {
    require('../shared.js');
  }).not.toThrow();
  
  console.log('shared.js успешно загружен');
});

// Добавьте в конец shared.test.js
test('проверка что функции существуют в global scope', () => {
  // После загрузки shared.js функции должны быть в глобальной области видимости
  expect(typeof getUrlParam).toBe('function');
  expect(typeof getBackendUrl).toBe('function');
  console.log('getUrlParam is function:', typeof getUrlParam);
});