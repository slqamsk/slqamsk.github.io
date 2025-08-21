// orders.js
// Функция для получения данных из URL
function getDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const cartParam = urlParams.get('cart');
    const cart = {};
    
    if (cartParam && cartParam !== '') {
        cartParam.split(',').forEach(item => {
            const [id, quantity] = item.split(':');
            if (id && quantity) {
                cart[id] = parseInt(quantity);
            }
        });
    }
    
    return {
        cart: cart,
        name: urlParams.get('name') || '',
        email: urlParams.get('email') || ''
    };
}

// Функция для обновления всех ссылок на странице
function updateAllLinks() {
    const urlParams = new URLSearchParams();
    const data = getDataFromURL();
    
    // Сохраняем данные в URL
    const cartParams = [];
    for (const id in data.cart) {
        if (data.cart[id] > 0) {
            cartParams.push(`${id}:${data.cart[id]}`);
        }
    }
    
    if (cartParams.length > 0) {
        urlParams.set('cart', cartParams.join(','));
    }
    
    if (data.name) urlParams.set('name', data.name);
    if (data.email) urlParams.set('email', data.email);
    
    const queryString = urlParams.toString();
    
    // Обновляем все ссылки
    document.querySelectorAll('a[href*="index.html"]').forEach(link => {
        link.href = queryString ? `index.html?${queryString}` : 'index.html';
    });
    
    document.querySelectorAll('a[href*="cart.html"]').forEach(link => {
        link.href = queryString ? `cart.html?${queryString}` : 'cart.html';
    });
    
    document.querySelectorAll('a[href*="order.html"]').forEach(link => {
        link.href = queryString ? `order.html?${queryString}` : 'order.html';
    });
    
    document.querySelectorAll('a[href*="orders.html"]').forEach(link => {
        link.href = queryString ? `orders.html?${queryString}` : 'orders.html';
    });
}

// Функция для обновления счетчика корзины
function updateCartCounter() {
    const data = getDataFromURL();
    let totalCount = 0;
    
    for (const id in data.cart) {
        totalCount += data.cart[id];
    }
    
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalCount;
    }
}

// Функция для получения заказов из localStorage
function getOrders() {
    const orders = localStorage.getItem('pizzaOrders');
    return orders ? JSON.parse(orders) : [];
}

// Функция для сохранения заказов в localStorage
function saveOrders(orders) {
    localStorage.setItem('pizzaOrders', JSON.stringify(orders));
}

// Функция для отображения заказов
function displayOrders() {
    const orders = getOrders();
    const ordersListEl = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersListEl.innerHTML = '<p>У вас пока нет заказов</p>';
        return;
    }
    
    let html = '';
    orders.forEach((order, index) => {
        html += `
            <div class="order-item">
                <h3>Заказ #${order.orderNumber}</h3>
                <p><strong>Имя:</strong> ${order.name}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Дата:</strong> ${new Date(order.date).toLocaleString()}</p>
                <p><strong>Статус:</strong> ${order.status}</p>
                <p><strong>Пиццы:</strong></p>
                <ul>
        `;
        
        let total = 0;
        order.items.forEach(item => {
            const pizza = pizzaData.find(p => p.id == item.id);
            if (pizza) {
                const itemTotal = pizza.price * item.quantity;
                total += itemTotal;
                html += `<li>${pizza.name} - ${item.quantity} шт. × ${pizza.price} ₽ = ${itemTotal} ₽</li>`;
            }
        });
        
        html += `
                </ul>
                <p><strong>Общая стоимость:</strong> ${total} ₽</p>
                <button class="btn clear-btn cancel-order-btn" data-index="${index}">
                    Отменить заказ
                </button>
            </div>
        `;
    });
    
    ordersListEl.innerHTML = html;
    
    // Добавляем обработчики для кнопок отмены
    document.querySelectorAll('.cancel-order-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            cancelOrder(index);
        });
    });
}

// Функция для отмены заказа
function cancelOrder(index) {
    const orders = getOrders();
    if (confirm('Вы уверены, что хотите отменить этот заказ?')) {
        orders.splice(index, 1);
        saveOrders(orders);
        displayOrders();
    }
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    displayOrders();
    updateAllLinks();
    updateCartCounter(); // Обновляем счетчик при загрузке
});