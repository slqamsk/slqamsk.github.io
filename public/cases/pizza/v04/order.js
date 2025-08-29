// order.js
// Функция для получения корзины из URL параметров
function getCartFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const cartParam = urlParams.get('cart');
    const cart = {};
    
    if (cartParam) {
        cartParam.split(',').forEach(item => {
            const [id, quantity] = item.split(':');
            cart[id] = parseInt(quantity);
        });
    }
    
    return cart;
}

// Функция для получения данных пользователя из URL
function getUserDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        name: urlParams.get('name') || '',
        email: urlParams.get('email') || ''
    };
}

// Функция для обновления URL с текущими данными
function updateURL() {
    const cart = getCartFromURL();
    const nameInput = document.getElementById('customer-name');
    const emailInput = document.getElementById('customer-email');
    
    const cartParams = [];
    for (const id in cart) {
        cartParams.push(`${id}:${cart[id]}`);
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('cart', cartParams.join(','));
    
    if (nameInput.value) urlParams.set('name', nameInput.value);
    if (emailInput.value) urlParams.set('email', emailInput.value);
    
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

const cart = getCartFromURL();
const orderSummaryEl = document.getElementById('order-summary');
const orderInfoEl = document.getElementById('order-info');
const confirmBtn = document.getElementById('confirm-order');
const nameInput = document.getElementById('customer-name');
const emailInput = document.getElementById('customer-email');
const backToCartLink = document.getElementById('back-to-cart');
const backToMenuLink = document.getElementById('back-to-menu');

// Заполняем поля формы данными из URL
const userData = getUserDataFromURL();
if (userData.name) nameInput.value = userData.name;
if (userData.email) emailInput.value = userData.email;

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
    
    let orderDetails = `
        <h3>Заказ успешно оформлен!</h3>
        <p><strong>Номер заказа:</strong> #${Math.floor(Math.random() * 10000)}</p>
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
    `;
    
    orderInfoEl.innerHTML = orderDetails;
    orderInfoEl.style.display = 'block';
    
    // Скрываем форму после оформления
    document.querySelector('.order-form').style.display = 'none';
    orderSummaryEl.style.display = 'none';
});

// Обновляем ссылки с параметрами
function updateNavigationLinks() {
    const urlParams = new URLSearchParams(window.location.search);
    
    backToCartLink.href = `cart.html?${urlParams.toString()}`;
    backToMenuLink.href = `index.html?${urlParams.toString()}`;
}

// Обновляем URL при изменении полей ввода
nameInput.addEventListener('input', function() {
    updateURL();
    updateNavigationLinks();
});

emailInput.addEventListener('input', function() {
    updateURL();
    updateNavigationLinks();
});

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    updateOrderSummary();
    updateNavigationLinks();
});