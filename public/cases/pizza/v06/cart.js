// cart.js
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
    } else {
        urlParams.delete('cart');
    }
    
    if (data.name) urlParams.set('name', data.name);
    if (data.email) urlParams.set('email', data.email);
    
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
    
    // Обновляем все ссылки
    updateAllLinks();
}

// Функция для обновления всех ссылок на странице
function updateAllLinks() {
    const urlParams = new URLSearchParams(window.location.search);
    const data = getDataFromURL();
    
    // Сохраняем данные в URL для ссылок
    const cartParams = [];
    for (const id in data.cart) {
        if (data.cart[id] > 0) {
            cartParams.push(`${id}:${data.cart[id]}`);
        }
    }
    
    if (cartParams.length > 0) {
        urlParams.set('cart', cartParams.join(','));
    } else {
        urlParams.delete('cart');
    }
    
    if (data.name) urlParams.set('name', data.name);
    if (data.email) urlParams.set('email', data.email);
    
    // Обновляем все ссылки
    document.querySelectorAll('a[href*="index.html"]').forEach(link => {
        link.href = `index.html?${urlParams.toString()}`;
    });
    
    document.querySelectorAll('a[href*="cart.html"]').forEach(link => {
        link.href = `cart.html?${urlParams.toString()}`;
    });
    
    document.querySelectorAll('a[href*="order.html"]').forEach(link => {
        link.href = `order.html?${urlParams.toString()}`;
    });
    
    document.querySelectorAll('a[href*="orders.html"]').forEach(link => {
        link.href = `orders.html?${urlParams.toString()}`;
    });
}

const data = getDataFromURL();
const cart = data.cart;
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
            updateURLWithData(data);
            updateCart();
        });
    });
    
    document.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            cart[id] = (cart[id] || 0) + 1;
            updateURLWithData(data);
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

// Очистка корзины
clearBtn.addEventListener('click', function() {
    for (const key in cart) {
        delete cart[key];
    }
    updateURLWithData(data);
    updateCart();
});

// Переход к оформлению заказа
orderBtn.addEventListener('click', function() {
    if (Object.keys(cart).length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    // Сохраняем текущее состояние перед переходом
    updateURLWithData(data);
    window.location.href = `order.html?${new URLSearchParams(window.location.search).toString()}`;
});

// Обновляем ссылку возврата с параметрами
if (backLink) {
    backLink.addEventListener('click', function(e) {
        e.preventDefault();
        updateURLWithData(data); // Сохраняем текущее состояние перед переходом
        window.location.href = `index.html?${new URLSearchParams(window.location.search).toString()}`;
    });
}

// Инициализация корзины
updateCart();
updateAllLinks();