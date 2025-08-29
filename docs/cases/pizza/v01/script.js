// Данные о пиццах
const pizzaData = [
    {
        name: "Маргарита",
        description: "Томатный соус, моцарелла, базилик",
        price: 450,
        available: "Y" // Доступна - отображается и можно добавить в корзину
    },
    {
        name: "Пепперони",
        description: "Томатный соус, моцарелла, пепперони",
        price: 550,
        available: "Y" // Доступна - отображается и можно добавить в корзину
    },
    {
        name: "Гавайская",
        description: "Томатный соус, моцарелла, курица, ананас",
        price: 500,
        available: "Y" // Доступна - отображается и можно добавить в корзину
    },
    {
        name: "Четыре сыра",
        description: "Сливочный соус, моцарелла, пармезан, дор блю, чеддер",
        price: 600,
        available: "Y" // Доступна - отображается и можно добавить в корзину
    },
    {
        name: "Вегетарианская",
        description: "Томатный соус, моцарелла, перец, грибы, оливки, кукуруза",
        price: 500,
        available: "Y" // Недоступна - отображается серой, но нельзя добавить
    },
    {
        name: "Карбонара",
        description: "Сливочный соус, моцарелла, бекон, яйцо, пармезан",
        price: 580,
        available: "H" // Скрыта - не отображается в меню вообще
    },
    {
        name: "Мясная",
        description: "Томатный соус, моцарелла, пепперони, ветчина, бекон, курица",
        price: 650,
        available: "Y" // Доступна - отображается и можно добавить в корзину
    },
    {
        name: "Трюфельная",
        description: "Сливочный соус, моцарелла, трюфельное масло, грибы, пармезан",
        price: 750,
        available: "N" // Скрыта - не отображается в меню вообще
    },
    {
        name: "Диабло",
        description: "Острый томатный соус, моцарелла, салями, перец халапеньо, чили",
        price: 570,
        available: "H" // Скрыта - не отображается в меню вообще
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

// Создаем объект prices для обратной совместимости (только для доступных пицц)
const prices = {};
pizzaData.forEach(pizza => {
    if (pizza.available === "Y") {
        // Для пиццы дня используем цену со скидкой
        if (pizzaOfTheDay && pizza.name === pizzaOfTheDay.name) {
            prices[pizza.name] = Math.round(pizza.price * 0.9);
        } else {
            prices[pizza.name] = pizza.price;
        }
    }
});

const cart = {};
const notificationArea = document.getElementById('notification-area');
const cartItemsEl = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');
const orderInfoEl = document.getElementById('order-info');
const clearBtn = document.getElementById('clear-cart');
const orderBtn = document.getElementById('place-order');
const menuContainer = document.getElementById('menu-container');

// Функция для создания карточек меню
function createMenuCards() {
    menuContainer.innerHTML = ''; // Очищаем контейнер
    
    pizzaData.forEach(pizza => {
        // Показываем только пиццы с available: "Y" или "N"
        if (pizza.available === "Y" || pizza.available === "N") {
            const isPizzaOfTheDay = pizzaOfTheDay && pizza.name === pizzaOfTheDay.name;
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
                <button class="btn add-to-cart-btn" ${pizza.available === "N" ? 'disabled' : ''}>
                    ${pizza.available === "Y" ? 'Добавить' : 'Не доступно'}
                </button>
            `;
            menuContainer.appendChild(card);
        }
        // Пиццы с available: "H" не отображаются вообще
    });

    // Добавляем обработчики событий для кнопок "Добавить" (только для доступных пицц)
    document.querySelectorAll('.add-to-cart-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function() {
            // Находим название пиццы через соседние элементы
            const card = this.closest('.card');
            const productName = card.querySelector('.pizza-name').textContent.replace(' (пицца дня)', '').trim();
            
            // Находим цену через соседние элементы
            let productPrice;
            const priceElement = card.querySelector('.discount-price') || card.querySelector('.price');
            if (priceElement) {
                productPrice = parseInt(priceElement.textContent.replace(' ₽', ''));
            } else {
                // Если не нашли цену, используем данные из объекта prices
                productPrice = prices[productName];
            }
            
            // Добавляем товар в корзину
            cart[productName] = (cart[productName] || 0) + 1;
            
            // Показываем сообщение
            showNotification(`Добавлено: ${productName}`, 'info');
            
            // Обновляем корзину
            updateCart();
        });
    });
}

// Инициализация меню
createMenuCards();

// Показываем уведомление о пицце дня
if (pizzaOfTheDay) {
    showNotification(`🍕 Пицца дня: ${pizzaOfTheDay.name} со скидкой 10%!`, 'info');
}

// Очистка корзины
clearBtn.addEventListener('click', function() {
    for (const key in cart) {
        delete cart[key];
    }
    updateCart();
    showNotification('Корзина очищена', 'info');
    orderInfoEl.style.display = 'none';
});

// Оформление заказа
orderBtn.addEventListener('click', function() {
    const name = document.getElementById('customer-name').value;
    const email = document.getElementById('customer-email').value;
    
    if (!name || !email) {
        showNotification('Пожалуйста, заполните все поля!', 'error');
        return;
    }
    
    if (Object.keys(cart).length === 0) {
        showNotification('Корзина пуста!', 'error');
        return;
    }
    
    let orderDetails = `
        <h3>Заказ пиццы оформлен!</h3>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Выбранные пиццы:</strong></p>
        <ul>
    `;
    
    for (const [name, quantity] of Object.entries(cart)) {
        orderDetails += `<li>${name} - ${quantity} шт. (${prices[name] * quantity} ₽)</li>`;
    }
    
    orderDetails += `
        </ul>
        <p><strong>Общая стоимость:</strong> ${calculateTotal()} ₽</p>
        <p>Спасибо за ваш заказ! Мы свяжемся с вами для подтверждения.</p>
    `;
    
    orderInfoEl.innerHTML = orderDetails;
    orderInfoEl.style.display = 'block';
    showNotification('Заказ успешно оформлен!', 'info');
});

// Обновление корзины
function updateCart() {
    if (Object.keys(cart).length === 0) {
        cartItemsEl.innerHTML = '<p>Корзина пуста</p>';
        totalPriceEl.textContent = 'Итого: 0 ₽';
        return;
    }
    
    let html = '';
    for (const [name, quantity] of Object.entries(cart)) {
        html += `
        <div class="cart-item">
            <span>${name}</span>
            <div class="cart-controls">
                <button class="quantity-btn minus">-</button>
                <span>${quantity}</span>
                <button class="quantity-btn plus">+</button>
            </div>
        </div>
        `;
    }
    cartItemsEl.innerHTML = html;
    totalPriceEl.textContent = `Итого: ${calculateTotal()} ₽`;
    
    // Добавляем обработчики для кнопок +/-
    document.querySelectorAll('.minus').forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const name = Object.keys(cart)[index];
            if (cart[name] > 1) {
                cart[name]--;
            } else {
                delete cart[name];
            }
            updateCart();
            showNotification(`Уменьшено количество: ${name}`, 'info');
        });
    });
    
    document.querySelectorAll('.plus').forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const name = Object.keys(cart)[index];
            cart[name]++;
            updateCart();
            showNotification(`Увеличено количество: ${name}`, 'info');
        });
    });
}

// Расчет общей суммы
function calculateTotal() {
    let total = 0;
    for (const [name, quantity] of Object.entries(cart)) {
        total += prices[name] * quantity;
    }
    return total;
}

// Показать временное сообщение (заменяет предыдущее)
function showNotification(text, type = 'info') {
    notificationArea.innerHTML = '';
    const notification = document.createElement('div');
    notification.className = `notification ${type}-notification`;
    notification.textContent = text;
    notificationArea.appendChild(notification);
}