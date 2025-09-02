// __tests__/modules/api.test.js
import { getProducts } from '../../moduls/api.js';

// Мокаем глобальный fetch
global.fetch = jest.fn();

describe('getProducts function', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('should fetch products successfully', async () => {
        // 1. Подготовка (Arrange)
        const mockAppUrl = 'https://test-url.com/exec';
        const mockProducts = [
            { id: 1, name: 'Молоко' },
            { id: 2, name: 'Хлеб' }
        ];

        // Мокаем успешный ответ
        fetch.mockResolvedValueOnce({
            ok: true,
            headers: { get: () => 'application/json' },
            json: () => Promise.resolve(mockProducts)
        });

        // 2. Действие (Act)
        const result = await getProducts(mockAppUrl);

        // 3. Проверка (Assert)
        expect(fetch).toHaveBeenCalledWith(`${mockAppUrl}?action=getProducts`);
        expect(result).toEqual(mockProducts);
    });
});