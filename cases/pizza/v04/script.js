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

// Функция для обновления счетчика корзины
function updateCartCounter() {
    const cart = getCartFromURL();
    let totalCount = 0;
    
    for (const id in cart) {
        totalCount += cart[id];
    }
    
    document.getElementById('cart-count').textContent = totalCount;
    
    // Обновляем ссылку на корзину с текущими параметрами
    const cartLink = document.getElementById('cart-link');
    const currentParams = new URLSearchParams(window.location.search);
    cartLink.href = `cart.html?${currentParams.toString()}`;
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
            
            // Получаем текущую корзину из URL
            const currentCart = getCartFromURL();
            
            // Добавляем товар в корзину
            currentCart[pizzaId] = (currentCart[pizzaId] || 0) + 1;
            
            // Формируем новый URL с обновленной корзиной
            updateURLWithCart(currentCart);
            
            // Обновляем счетчик корзины
            updateCartCounter();
            
            showNotification(`Добавлено: ${pizza.name}`, 'info');
        });
    });
}

// Функция для обновления URL с корзиной
function updateURLWithCart(cart) {
    const cartParams = [];
    for (const id in cart) {
        cartParams.push(`${id}:${cart[id]}`);
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('cart', cartParams.join(','));
    
    // Сохраняем также данные пользователя если они есть
    const userData = getUserDataFromURL();
    if (userData.name) urlParams.set('name', userData.name);
    if (userData.email) urlParams.set('email', userData.email);
    
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

// Функция для получения данных пользователя из URL
function getUserDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        name: urlParams.get('name') || '',
        email: urlParams.get('email') || ''
    };
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
    notificationArea.innerHTML = '';
    const notification = document.createElement('div');
    notification.className = `notification ${type}-notification`;
    notification.textContent = text;
    notificationArea.appendChild(notification);
}