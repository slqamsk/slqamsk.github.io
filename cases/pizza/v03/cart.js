// cart.js
// Данные о пиццах теперь импортируются из pizza-data.js

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

const cart = getCartFromURL();
const cartItemsEl = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');
const orderInfoEl = document.getElementById('order-info');
const clearBtn = document.getElementById('clear-cart');
const orderBtn = document.getElementById('place-order');
const nameInput = document.getElementById('customer-name');
const emailInput = document.getElementById('customer-email');

// Заполняем поля формы данными из URL
const userData = getUserDataFromURL();
if (userData.name) nameInput.value = userData.name;
if (userData.email) emailInput.value = userData.email;

// Обновление корзины
function updateCart() {
    if (Object.keys(cart).length === 0) {
        cartItemsEl.innerHTML = '<p>Корзина пуста</p>';
        totalPriceEl.textContent = 'Итого: 0 ₽';
        return;
    }
    
    let html = '';
    for (const [id, quantity] of Object.entries(cart)) {
        const pizza = pizzaData.find(p => p.id == id);
        if (!pizza) continue;
        
        html += `
        <div class="cart-item">
            <span>${pizza.name} - ${pizza.price} ₽</span>
            <div class="cart-controls">
                <button class="quantity-btn minus" data-id="${id}">-</button>
                <span>${quantity}</span>
                <button class="quantity-btn plus" data-id="${id}">+</button>
            </div>
        </div>
        `;
    }
    cartItemsEl.innerHTML = html;
    totalPriceEl.textContent = `Итого: ${calculateTotal()} ₽`;
    
    // Добавляем обработчики для кнопок +/-
    document.querySelectorAll('.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (cart[id] > 1) {
                cart[id]--;
            } else {
                delete cart[id];
            }
            updateURL();
            updateCart();
        });
    });
    
    document.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            cart[id] = (cart[id] || 0) + 1;
            updateURL();
            updateCart();
        });
    });
}

// Расчет общей суммы
function calculateTotal() {
    let total = 0;
    for (const [id, quantity] of Object.entries(cart)) {
        const pizza = pizzaData.find(p => p.id == id);
        if (pizza) {
            total += pizza.price * quantity;
        }
    }
    return total;
}

// Обновление URL с текущей корзиной
function updateURL() {
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

// Очистка корзины
clearBtn.addEventListener('click', function() {
    for (const key in cart) {
        delete cart[key];
    }
    updateURL();
    updateCart();
    orderInfoEl.style.display = 'none';
});

// Оформление заказа
orderBtn.addEventListener('click', function() {
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
        <h3>Заказ пиццы оформлен!</h3>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Выбранные пиццы:</strong></p>
        <ul>
    `;
    
    for (const [id, quantity] of Object.entries(cart)) {
        const pizza = pizzaData.find(p => p.id == id);
        if (pizza) {
            orderDetails += `<li>${pizza.name} - ${quantity} шт. (${pizza.price * quantity} ₽)</li>`;
        }
    }
    
    orderDetails += `
        </ul>
        <p><strong>Общая стоимость:</strong> ${calculateTotal()} ₽</p>
        <p>Спасибо за ваш заказ! Мы свяжемся с вами для подтверждения.</p>
    `;
    
    orderInfoEl.innerHTML = orderDetails;
    orderInfoEl.style.display = 'block';
});

// Обновляем ссылку возврата с параметрами
document.getElementById('back-link').addEventListener('click', function(e) {
    e.preventDefault();
    updateURL(); // Сохраняем текущее состояние перед переходом
    window.location.href = `index.html?${new URLSearchParams(window.location.search).toString()}`;
});

// Обновляем URL при изменении полей ввода
nameInput.addEventListener('input', updateURL);
emailInput.addEventListener('input', updateURL);

// Инициализация корзины
updateCart();