// Данные о пиццах
const pizzaData = [
    {
        id: 1,
        name: "Маргарита",
        description: "Томатный соус, моцарелла, базилик",
        price: 450,
        available: "Y"
    },
    {
        id: 2,
        name: "Пепперони",
        description: "Томатный соус, моцарелла, пепперони",
        price: 550,
        available: "Y"
    },
    {
        id: 3,
        name: "Гавайская",
        description: "Томатный соус, моцарелла, курица, ананас",
        price: 500,
        available: "Y"
    },
    {
        id: 4,
        name: "Четыре сыра",
        description: "Сливочный соус, моцарелла, пармезан, дор блю, чеддер",
        price: 600,
        available: "Y"
    },
    {
        id: 5,
        name: "Вегетарианская",
        description: "Томатный соус, моцарелла, перец, грибы, оливки, кукуруза",
        price: 500,
        available: "Y"
    },
    {
        id: 6,
        name: "Карбонара",
        description: "Сливочный соус, моцарелла, бекон, яйцо, пармезан",
        price: 580,
        available: "H"
    },
    {
        id: 7,
        name: "Мясная",
        description: "Томатный соус, моцарелла, пепперони, ветчина, бекон, курица",
        price: 650,
        available: "Y"
    },
    {
        id: 8,
        name: "Трюфельная",
        description: "Сливочный соус, моцарелла, трюфельное масло, грибы, пармезан",
        price: 750,
        available: "N"
    },
    {
        id: 9,
        name: "Диабло",
        description: "Острый томатный соус, моцарелла, салями, перец халапеньо, чили",
        price: 570,
        available: "H"
    }
];

// Пиццы, которые никогда не могут быть пиццей дня
const excludedFromDaily = ["Маргарита", "Четыре сыра", "Вегетарианская"];

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
            const cartParams = [];
            for (const id in currentCart) {
                cartParams.push(`${id}:${currentCart[id]}`);
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('cart', cartParams.join(','));
            
            // Обновляем URL без перезагрузки страницы
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState({}, '', newUrl);
            
            // Обновляем счетчик корзины
            updateCartCounter();
            
            showNotification(`Добавлено: ${pizza.name}`, 'info');
        });
    });
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
    
    // Заполняем поля формы, если данные есть в URL
    const userData = getUserDataFromURL();
    if (userData.name) {
        document.getElementById('customer-name').value = userData.name;
    }
    if (userData.email) {
        document.getElementById('customer-email').value = userData.email;
    }
    
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