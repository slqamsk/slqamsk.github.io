// script.js
// Данные о пиццах теперь импортируются из pizza-data.js
// Выбираем случайную пиццу дня из доступных, исключая запрещенные
function getPizzaOfTheDay() {
    const availablePizzas = pizzaData.filter(pizza => 
        pizza.available === "Y" && !excludedFromDaily.includes(pizza.name)
    );
    
    if (availablePizzas.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availablePizzas.length);
    return availablePizzas[randomIndex];
}

const pizzaOfTheDay = getPizzaOfTheDay();

// Создаем объект prices для обратной совместимости
const prices = {};
pizzaData.forEach(pizza => {
    if (pizza.available === "Y") {
        if (pizzaOfTheDay && pizza.id === pizzaOfTheDay.id) {
            prices[pizza.id] = Math.round(pizza.price * 0.9);
        } else {
            prices[pizza.id] = pizza.price;
        }
    }
});

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

// Функция для обновления счетчика корзины и ссылок
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
    
    // Обновляем все ссылки с параметрами
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
}

const notificationArea = document.getElementById('notification-area');
const menuContainer = document.getElementById('menu-container');

// Функция для создания карточек меню
function createMenuCards() {
    menuContainer.innerHTML = '';
    
    pizzaData.forEach(pizza => {
        if (pizza.available === "Y" || pizza.available === "N") {
            const isPizzaOfTheDay = pizzaOfTheDay && pizza.id === pizzaOfTheDay.id;
            const discountedPrice = isPizzaOfTheDay ? Math.round(pizza.price * 0.9) : pizza.price;
            
            const card = document.createElement('div');
            card.className = pizza.available === "Y" ? 
                (isPizzaOfTheDay ? 'card pizza-of-the-day' : 'card') : 
                'card unavailable';
            
            let priceHTML = '';
            if (isPizzaOfTheDay) {
                priceHTML = `
                    <div class="price">
                        <span class="discount-price">${discountedPrice} ₽</span>
                        <span class="original-price">${pizza.price} ₽</span>
                    </div>
                    <div class="discount-text">Скидка 10%</div>
                `;
            } else {
                priceHTML = `<div class="price">${pizza.price} ₽</div>`;
            }
            
            card.innerHTML = `
                ${isPizzaOfTheDay ? '<div class="pizza-of-the-day-badge">Пицца дня!</div>' : ''}
                <h3 class="pizza-name">${pizza.name}${isPizzaOfTheDay ? ' (пицца дня)' : ''}</h3>
                <p class="pizza-description">${pizza.description}${isPizzaOfTheDay ? ' Скидка 10%' : ''}</p>
                ${priceHTML}
                <button class="btn add-to-cart-btn" data-id="${pizza.id}" ${pizza.available === "N" ? 'disabled' : ''}>
                    ${pizza.available === "Y" ? 'Добавить' : 'Не доступно'}
                </button>
            `;
            menuContainer.appendChild(card);
        }
    });

    // Добавляем обработчики событий для кнопок "Добавить"
    document.querySelectorAll('.add-to-cart-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function() {
            const pizzaId = this.getAttribute('data-id');
            const pizza = pizzaData.find(p => p.id == pizzaId);
            
            if (!pizza) return;
            
            // Получаем текущие данные из URL
            const data = getDataFromURL();
            
            // Добавляем товар в корзину
            data.cart[pizzaId] = (data.cart[pizzaId] || 0) + 1;
            
            // Формируем новый URL с обновленными данными
            updateURLWithData(data);
            
            // Обновляем счетчик корзины и ссылки
            updateCartCounter();
            
            showNotification(`Добавлено: ${pizza.name}`, 'info');
        });
    });
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    createMenuCards();
    updateCartCounter();
    
    if (pizzaOfTheDay) {
        showNotification(`🍕 Пицца дня: ${pizzaOfTheDay.name} со скидкой 10%!`, 'info');
    }
});

// Показать временное сообщение
function showNotification(text, type = 'info') {
    if (!notificationArea) return;
    
    notificationArea.innerHTML = '';
    const notification = document.createElement('div');
    notification.className = `notification ${type}-notification`;
    notification.textContent = text;
    notificationArea.appendChild(notification);
}