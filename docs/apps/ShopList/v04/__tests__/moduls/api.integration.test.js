// __tests__/modules/api.integration.test.js
import fetch from 'node-fetch';
global.fetch = fetch;

import { getProducts } from '../../moduls/api.js';

const REAL_API_URL = process.env.REAL_API_URL;

const describeIf = REAL_API_URL ? describe : describe.skip;

describeIf('getProducts INTEGRATION tests', () => {
    jest.setTimeout(15000); // Увеличиваем таймаут

    test('should connect to real API and return array', async () => {
        console.log('🌐 Отправляю запрос к API:');
        console.log('📤 URL:', `${REAL_API_URL}?action=getProducts`);
        console.log('📤 Метод: GET');
        console.log('📤 Время:', new Date().toLocaleTimeString());
        
        const startTime = Date.now();
        const result = await getProducts(REAL_API_URL);
        const duration = Date.now() - startTime;
        
        console.log('📥 Ответ получен за:', duration, 'ms');
        console.log('📥 Тип ответа:', Array.isArray(result) ? 'Array' : typeof result);
        console.log('📥 Длина массива:', result.length);
        
        if (result.length > 0) {
            console.log('📥 Первый элемент:', JSON.stringify(result[0], null, 2));
        }
        
        expect(Array.isArray(result)).toBe(true);
        
        if (result.length > 0) {
            expect(result[0]).toHaveProperty('id');
            expect(result[0]).toHaveProperty('name');
        }
    });

    test('should handle API errors gracefully', async () => {
        const invalidUrl = 'http://localhost:9999/invalid';
        
        console.log('🌐 Тестирую обработку ошибок:');
        console.log('📤 URL:', `${invalidUrl}?action=getProducts`);
        console.log('📤 Ожидаю ошибку...');
        
        const startTime = Date.now();
        try {
            await getProducts(invalidUrl);
            console.log('❌ Ошибка: Promise не был rejected');
        } catch (error) {
            const duration = Date.now() - startTime;
            console.log('✅ Получена ошибка за:', duration, 'ms');
            console.log('✅ Текст ошибки:', error.message);
        }
        
        await expect(getProducts(invalidUrl))
            .rejects
            .toThrow();
    });
});

// Debug-тест для анализа ответа
test('debug API response', async () => {
    if (!REAL_API_URL) return;
    
    console.log('🔍 Debug: Анализирую сырой ответ API');
    const testUrl = `${REAL_API_URL}?action=getProducts`;
    console.log('📤 Запрос:', testUrl);
    
    const response = await fetch(testUrl);
    console.log('📥 Статус:', response.status, response.statusText);
    console.log('📥 Заголовки:');
    Array.from(response.headers.entries()).forEach(([key, value]) => {
        console.log('   ', key + ':', value);
    });
    
    const contentType = response.headers.get('content-type');
    console.log('📥 Content-Type:', contentType);
    
    const text = await response.text();
    console.log('📥 Тело ответа (первые 500 символов):');
    console.log(text.substring(0, 500));
    
    if (contentType?.includes('application/json')) {
        try {
            const json = JSON.parse(text);
            console.log('📥 JSON parsed successfully');
            console.log('📥 JSON keys:', Object.keys(json));
        } catch (e) {
            console.log('❌ JSON parse error:', e.message);
        }
    }
});