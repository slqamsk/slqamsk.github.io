// cart.js
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

const cart = getCartFromURL();
const cartItemsEl = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');
const clearBtn = document.getElementById('clear-cart');
const orderBtn = document.getElementById('place-order');
const backLink = document.getElementById('back-link');

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
    
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
    
    // Обновляем ссылку возврата
    backLink.href = `index.html?${urlParams.toString()}`;
    
    // Обновляем ссылку на заказы если она есть
    const ordersLink = document.getElementById('orders-link');
    if (ordersLink) {
        ordersLink.href = `orders.html?${urlParams.toString()}`;
    }
}

// Очистка корзины
clearBtn.addEventListener('click', function() {
    for (const key in cart) {
        delete cart[key];
    }
    updateURL();
    updateCart();
});

// Переход к оформлению заказа
orderBtn.addEventListener('click', function() {
    if (Object.keys(cart).length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    // Сохраняем текущее состояние перед переходом
    updateURL();
    window.location.href = `order.html?${new URLSearchParams(window.location.search).toString()}`;
});

// Обновляем ссылку возврата с параметрами
backLink.addEventListener('click', function(e) {
    e.preventDefault();
    updateURL(); // Сохраняем текущее состояние перед переходом
    window.location.href = `index.html?${new URLSearchParams(window.location.search).toString()}`;
});

// Инициализация корзины
updateCart();