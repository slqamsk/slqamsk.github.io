// order.js
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

// Функция для обновления URL с данными
function updateURLWithData(data) {
    const cartParams = [];
    for (const id in data.cart) {
        if (data.cart[id] > 0) {
            cartParams.push(`${id}:${data.cart[id]}`);
        }
    }
    
    const urlParams = new URLSearchParams();
    
    if (cartParams.length > 0) {
        urlParams.set('cart', cartParams.join(','));
    }
    
    if (data.name) urlParams.set('name', data.name);
    if (data.email) urlParams.set('email', data.email);
    
    const newUrl = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    
    // Обновляем все ссылки
    updateAllLinks();
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

// Функция для очистки корзины в данных
function clearCartInData(data) {
    for (const key in data.cart) {
        delete data.cart[key];
    }
    return data;
}

const data = getDataFromURL();
const cart = data.cart;
const orderSummaryEl = document.getElementById('order-summary');
const orderInfoEl = document.getElementById('order-info');
const confirmBtn = document.getElementById('confirm-order');
const nameInput = document.getElementById('customer-name');
const emailInput = document.getElementById('customer-email');

// Заполняем поля формы данными из URL
if (data.name) nameInput.value = data.name;
if (data.email) emailInput.value = data.email;

// Обновляем сводку заказа
function updateOrderSummary() {
    if (Object.keys(cart).length === 0) {
        orderSummaryEl.innerHTML = '<p>Корзина пуста</p>';
        return;
    }
    
    let html = `
        <h3>Ваш заказ:</h3>
        <div class="cart">
            <div id="order-items">
    `;
    
    let total = 0;
    for (const [id, quantity] of Object.entries(cart)) {
        const pizza = pizzaData.find(p => p.id == id);
        if (pizza) {
            const itemTotal = pizza.price * quantity;
            total += itemTotal;
            html += `
                <div class="cart-item">
                    <span>${pizza.name} - ${quantity} шт. × ${pizza.price} ₽</span>
                    <span>${itemTotal} ₽</span>
                </div>
            `;
        }
    }
    
    html += `
            </div>
            <div class="total-price">
                Итого: ${total} ₽
            </div>
        </div>
    `;
    
    orderSummaryEl.innerHTML = html;
}

// Подтверждение заказа
confirmBtn.addEventListener('click', function() {
    const name = nameInput.value;
    const email = emailInput.value;
    
    if (!name || !email) {
        alert('Пожалуйста, заполните все поля!');
        return;
    }
    
    if (Object.keys(cart).length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    // Сохраняем данные пользователя
    data.name = name;
    data.email = email;
    updateURLWithData(data);
    
    // Сохраняем заказ
    const newOrder = addOrder(cart, name, email);
    
    let orderDetails = `
        <h3>Заказ успешно оформлен!</h3>
        <p><strong>Номер заказа:</strong> #${newOrder.orderNumber}</p>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Выбранные пиццы:</strong></p>
        <ul>
    `;
    
    let total = 0;
    for (const [id, quantity] of Object.entries(cart)) {
        const pizza = pizzaData.find(p => p.id == id);
        if (pizza) {
            const itemTotal = pizza.price * quantity;
            total += itemTotal;
            orderDetails += `<li>${pizza.name} - ${quantity} шт. (${itemTotal} ₽)</li>`;
        }
    }
    
    orderDetails += `
        </ul>
        <p><strong>Общая стоимость:</strong> ${total} ₽</p>
        <p><strong>Статус:</strong> Ожидает подтверждения</p>
        <p>Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время для подтверждения.</p>
        <a href="orders.html" class="btn" style="text-decoration: none; margin-top: 15px; display: inline-block;">
            Посмотреть мои заказы
        </a>
    `;
    
    orderInfoEl.innerHTML = orderDetails;
    orderInfoEl.style.display = 'block';
    
    // Очищаем корзину в данных и URL
    clearCartInData(data);
    updateURLWithData(data);
    updateCartCounter(); // Обновляем счетчик
    
    // Скрываем форму после оформления
    document.querySelector('.order-form').style.display = 'none';
    orderSummaryEl.style.display = 'none';
});

// Обновляем URL при изменении полей ввода
nameInput.addEventListener('input', function() {
    data.name = this.value;
    updateURLWithData(data);
});

emailInput.addEventListener('input', function() {
    data.email = this.value;
    updateURLWithData(data);
});

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    updateOrderSummary();
    updateAllLinks();
    updateCartCounter(); // Обновляем счетчик при загрузке
});