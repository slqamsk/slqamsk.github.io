// orders.js
// Функция для получения заказов из localStorage
function getOrders() {
    const orders = localStorage.getItem('pizzaOrders');
    return orders ? JSON.parse(orders) : [];
}

// Функция для сохранения заказов в localStorage
function saveOrders(orders) {
    localStorage.setItem('pizzaOrders', JSON.stringify(orders));
}

// Функция для получения данных из URL
function getDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const cartParam = urlParams.get('cart');
    const cart = {};
    
    if (cartParam) {
        cartParam.split(',').forEach(item => {
            const [id, quantity] = item.split(':');
            cart[id] = parseInt(quantity);
        });
    }
    
    return {
        cart: cart,
        name: urlParams.get('name') || '',
        email: urlParams.get('email') || ''
    };
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
            <div class="order-item" style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
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
                <button class="btn clear-btn cancel-order-btn" data-index="${index}" style="margin-top: 10px;">
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

// Функция для добавления нового заказа
function addOrder(cart, name, email) {
    const orders = getOrders();
    const orderNumber = Math.floor(Math.random() * 10000);
    
    const orderItems = [];
    for (const [id, quantity] of Object.entries(cart)) {
        orderItems.push({ id: parseInt(id), quantity: quantity });
    }
    
    const newOrder = {
        orderNumber: orderNumber,
        name: name,
        email: email,
        date: new Date().toISOString(),
        status: 'Ожидает подтверждения',
        items: orderItems
    };
    
    orders.push(newOrder);
    saveOrders(orders);
    
    return newOrder;
}

// Обновляем ссылки с параметрами
function updateNavigationLinks() {
    const urlParams = new URLSearchParams(window.location.search);
    
    document.querySelectorAll('a[href*="index.html"]').forEach(link => {
        link.href = `index.html?${urlParams.toString()}`;
    });
    
    document.querySelectorAll('a[href*="cart.html"]').forEach(link => {
        link.href = `cart.html?${urlParams.toString()}`;
    });
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    displayOrders();
    updateNavigationLinks();
});