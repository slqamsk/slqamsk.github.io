// modules/api.js
export async function getProducts(appUrl) {
    try {
        const response = await fetch(`${appUrl}?action=getProducts`);
        
        // Проверяем Content-Type
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('HTML error response: API returned non-JSON format');
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('Network error: No internet connection or backend unavailable');
        }
        throw error;
    }
}