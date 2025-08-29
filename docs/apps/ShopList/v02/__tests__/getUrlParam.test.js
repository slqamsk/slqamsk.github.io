// __tests__/first.test.js

// Импортируем функцию которую будем тестировать
const { getUrlParam } = require('../shared.js');

// Описываем группу тестов для функции getUrlParam
describe('getUrlParam', () => {
  
  // Это один тест-кейс
  test('должен вернуть значение параметра из URL', () => {
    
    // 1. ПОДГОТОВКА (Arrange) - готовим данные для теста
    // Сохраняем оригинальный window.location чтобы потом восстановить
    const originalLocation = window.location;
    
    // Создаем fake URL с параметрами для теста
    // Это как будто бы пользователь открыл страницу с таким адресом
    const testUrl = 'https://mysite.com?name=John&age=30';
    
    // Подменяем настоящий window.location на наш тестовый URL
    delete window.location;
    window.location = new URL(testUrl);

    // 2. ДЕЙСТВИЕ (Act) - вызываем функцию которую тестируем
    // Пытаемся получить параметр 'name' из URL
    const result = getUrlParam('name');
    
    // 3. ПРОВЕРКА (Assert) - проверяем что функция сработала правильно
    // Ожидаем что функция вернет 'John'
    expect(result).toBe('John');
    
    // 4. ВОССТАНОВЛЕНИЕ - возвращаем всё как было
    // Это важно чтобы другие тесты не сломались
    window.location = originalLocation;
  });
});