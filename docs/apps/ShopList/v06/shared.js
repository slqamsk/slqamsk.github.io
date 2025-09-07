/**
 * ShopList — shared.js (локальная версия)
 * Версия без бэкенда, с использованием localStorage
 */

// === ХРАНИЛИЩЕ ДАННЫХ ===

// Инициализация данных в localStorage
function initStorage() {
  if (!localStorage.getItem('shoplist-products')) {
    localStorage.setItem('shoplist-products', JSON.stringify([
      { id: 1, name: 'Молоко' },
      { id: 2, name: 'Хлеб' },
      { id: 3, name: 'Яйца' }
    ]));
  }
  
  if (!localStorage.getItem('shoplist-shopping-list')) {
    localStorage.setItem('shoplist-shopping-list', JSON.stringify([]));
  }
}

// Получение продуктов
function getProducts() {
  return JSON.parse(localStorage.getItem('shoplist-products')) || [];
}

// Добавление продукта
function addProduct(name) {
  if (!name || name.trim() === '') {
    return { success: false, message: 'Name is required' };
  }

  const products = getProducts();
  const lastId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
  const newProduct = { id: lastId + 1, name: name.trim() };
  
  products.push(newProduct);
  localStorage.setItem('shoplist-products', JSON.stringify(products));
  
  return { success: true, id: newProduct.id };
}

// Обновление продукта
function updateProduct(id, name) {
  if (!id || !name || name.trim() === '') {
    return { success: false, message: 'ID and name are required' };
  }

  const products = getProducts();
  const index = products.findIndex(p => p.id == id);
  
  if (index === -1) {
    return { success: false, message: 'Product not found' };
  }
  
  products[index].name = name.trim();
  localStorage.setItem('shoplist-products', JSON.stringify(products));
  
  return { success: true };
}

// Удаление продукта
function deleteProduct(id) {
  const products = getProducts();
  const index = products.findIndex(p => p.id == id);
  
  if (index === -1) {
    return { success: false, message: 'Product not found' };
  }
  
  products.splice(index, 1);
  localStorage.setItem('shoplist-products', JSON.stringify(products));
  
  // Также удаляем из списка покупок, если есть
  const shoppingList = getShoppingList();
  const updatedShoppingList = shoppingList.filter(item => item.productId != id);
  localStorage.setItem('shoplist-shopping-list', JSON.stringify(updatedShoppingList));
  
  return { success: true };
}

// Получение списка покупок
function getShoppingList() {
  return JSON.parse(localStorage.getItem('shoplist-shopping-list')) || [];
}

// Добавление в список покупок
function addToShoppingList(productId, productName) {
  if (!productId || !productName) {
    return { success: false, message: 'Product ID and name required' };
  }

  const shoppingList = getShoppingList();
  const exists = shoppingList.some(item => item.productId == productId);
  
  if (exists) {
    // БАГ 3: При повторном добавлении сбрасываем статус на "в процессе"
    const index = shoppingList.findIndex(item => item.productId == productId);
    shoppingList[index].status = 'pending';
    shoppingList[index].quantity = '';
    localStorage.setItem('shoplist-shopping-list', JSON.stringify(shoppingList));
    return { success: true, message: 'Status reset to pending' };
  }
  
  shoppingList.push({
    productId: productId,
    productName: productName,
    quantity: '',
    status: 'pending'
  });
  
  localStorage.setItem('shoplist-shopping-list', JSON.stringify(shoppingList));
  return { success: true };
}

// Обновление количества
function updateQuantity(productId, quantity) {
  const shoppingList = getShoppingList();
  const item = shoppingList.find(item => item.productId == productId);
  
  if (!item) {
    return { success: false, message: 'Not found' };
  }
  
  item.quantity = quantity || '';
  localStorage.setItem('shoplist-shopping-list', JSON.stringify(shoppingList));
  return { success: true };
}

// Обновление статуса
function updateStatus(productId, status) {
  if (!['bought', 'not_available'].includes(status)) {
    return { success: false, message: 'Invalid status' };
  }

  const shoppingList = getShoppingList();
  const item = shoppingList.find(item => item.productId == productId);
  
  if (!item) {
    return { success: false, message: 'Not found' };
  }
  
  item.status = status;
  localStorage.setItem('shoplist-shopping-list', JSON.stringify(shoppingList));
  return { success: true };
}

// Очистка списка покупок
function clearShoppingList() {
  localStorage.setItem('shoplist-shopping-list', JSON.stringify([]));
  return { success: true };
}

// Удаление купленных
function clearBought() {
  const shoppingList = getShoppingList();
  // БАГ 4: Удаляем не купленные, а те, которых не было
  const remaining = shoppingList.filter(item => item.status !== 'not_available');
  localStorage.setItem('shoplist-shopping-list', JSON.stringify(remaining));
  return { success: true, removed: shoppingList.length - remaining.length };
}

// === УТИЛИТЫ ===

function logError(message) {
  const errorLog = document.getElementById('error-log');
  if (errorLog) {
    // Очищаем предыдущие сообщения
    errorLog.innerHTML = '';
    
    const now = new Date().toLocaleTimeString('ru-RU');
    const entry = document.createElement('div');
    entry.style.fontSize = '12px';
    entry.style.color = '#721c24';
    entry.style.margin = '4px 0';
    entry.style.padding = '4px 0';
    entry.textContent = `[${now}] ${message}`;
    errorLog.appendChild(entry);
  }
}

function insertMainMenu() {
  const menuHtml = `
    <nav id="main-menu" style="margin-bottom: 20px; padding: 10px 0; border-bottom: 1px solid #ddd;">
      <a href="index.html">Главная</a> |
      <a href="products.html">Общий список</a> |
      <a href="shopping-list.html">Список покупок</a> |
      <a href="add-product.html">Добавить продукт</a>
    </nav>
  `;

  const container = document.createElement('div');
  container.innerHTML = menuHtml;

  const header = document.querySelector('header') || document.body;
  header.insertBefore(container.firstElementChild, header.firstChild);
}

// === Страница: index.html ===
function initIndexPage() {
  // Убираем предупреждение о локальной версии
  const errorLog = document.getElementById('error-log');
  if (errorLog) {
    errorLog.style.display = 'none';
  }
}

// === Страница: products.html ===
async function initProductsPage() {
  const productsList = document.getElementById('products-list');
  const viewAllBtn = document.getElementById('view-all');
  const viewNotInListBtn = document.getElementById('view-not-in-list');

  if (!productsList) {
    logError('initProductsPage: элемент #products-list не найден');
    return;
  }

  let products = [];
  let shoppingList = [];
  let currentView = 'all';

  function loadData() {
    products = getProducts();
    shoppingList = getShoppingList();
    renderList();
  }

  function isInShoppingList(productId) {
    return shoppingList.some(item => item.productId == productId);
  }

  function getFilteredProducts() {
    // БАГ 1: Фильтр "Не в списке" работает наоборот
    if (currentView === 'all') {
      return products;
    } else {
      return products.filter(p => isInShoppingList(p.id));
    }
  }

  function renderList() {
    productsList.innerHTML = '';
    const filtered = getFilteredProducts();

    if (filtered.length === 0) {
      productsList.innerHTML = '<li>Нет продуктов</li>';
      return;
    }

    filtered.forEach(product => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${product.name}
        <button data-id="${product.id}" class="add-to-shopping-list">Добавить</button>
        <button data-id="${product.id}" class="edit-product">Редактировать</button>
      `;
      productsList.appendChild(li);
    });

    // Обработчики для добавления в список покупок
    document.querySelectorAll('.add-to-shopping-list').forEach(button => {
      button.addEventListener('click', async (e) => {
        const productId = parseInt(e.target.dataset.id);
        const product = products.find(p => p.id === productId);
        if (!product) {
          logError(`Продукт с ID=${productId} не найден`);
          return;
        }

        const result = addToShoppingList(product.id, product.name);

        if (result && result.success) {
          logError(`Продукт "${product.name}" добавлен в список покупок`);
          if (currentView === 'not-in-list') {
            e.target.closest('li').remove();
          }
          shoppingList = getShoppingList();
        } else {
          logError(`Ошибка при добавлении: ${result.message}`);
        }
      });
    });

    // Обработчики для редактирования продукта
    document.querySelectorAll('.edit-product').forEach(button => {
      button.addEventListener('click', (e) => {
        // БАГ 2: Просто открываем страницу без параметра edit
        window.location.href = 'add-product.html';
      });
    });
  }

  viewAllBtn?.addEventListener('click', () => {
    currentView = 'all';
    viewAllBtn.classList.add('primary');
    viewNotInListBtn.classList.remove('primary');
    logError('Переключено на "Все"');
    renderList();
  });

  viewNotInListBtn?.addEventListener('click', () => {
    currentView = 'not-in-list';
    viewAllBtn.classList.remove('primary');
    viewNotInListBtn.classList.add('primary');
    logError('Переключено на "Не в списке"');
    renderList();
  });

  loadData();
  viewAllBtn?.classList.add('primary');
}

// === Страница: shopping-list.html ===
async function initShoppingListPage() {
  const shoppingListElement = document.getElementById('shopping-list');
  const clearAllBtn = document.getElementById('clear-all');
  const clearBoughtBtn = document.getElementById('clear-bought');

  if (!shoppingListElement) {
    logError('initShoppingListPage: элемент #shopping-list не найден');
    return;
  }

  let shoppingList = [];

  function loadData() {
    shoppingList = getShoppingList();
    renderList();
  }

  function getStatusText(status) {
    switch(status) {
      case 'bought': return 'купил';
      case 'not_available': return 'не было';
      default: return 'в процессе';
    }
  }

  function getStatusClass(status) {
    switch(status) {
      case 'bought': return 'status-bought';
      case 'not_available': return 'status-not-available';
      default: return 'status-pending';
    }
  }

  function renderList() {
    shoppingListElement.innerHTML = '';
    
    if (shoppingList.length === 0) {
      shoppingListElement.innerHTML = `
        <div class="shopping-list-item">
          <div colspan="4" style="grid-column: 1 / -1; text-align: center; padding: 20px;">
            Список покупок пуст
          </div>
        </div>
      `;
      return;
    }

    shoppingList.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'shopping-list-item';
      itemElement.innerHTML = `
        <div>${item.productName}</div>
        <div>
          <input type="text" class="quantity-input" value="${item.quantity || ''}" 
                 placeholder="шт." data-id="${item.productId}">
        </div>
        <div>
          <span class="status-indicator ${getStatusClass(item.status)}">
            ${getStatusText(item.status)}
          </span>
        </div>
        <div class="status-buttons">
          <button data-id="${item.productId}" class="status bought">Купил</button>
          <button data-id="${item.productId}" class="status not-available">Не было</button>
        </div>
      `;
      shoppingListElement.appendChild(itemElement);
    });

    // Обработчики для полей количества
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('blur', (e) => {
        const productId = parseInt(e.target.dataset.id);
        const quantity = e.target.value.trim();
        
        updateQuantity(productId, quantity);
        logError(`Количество для продукта обновлено`);
      });
    });

    // Обработчики для кнопок статуса
    document.querySelectorAll('.status').forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = parseInt(e.target.dataset.id);
        const status = e.target.classList.contains('bought') ? 'bought' : 'not_available';
        
        const result = updateStatus(productId, status);
        
        if (result && result.success) {
          logError(`Статус продукта изменен`);
          loadData(); // Перезагружаем данные для обновления отображения
        }
      });
    });
  }

  // Обработчик кнопки "Удалить всё"
  clearAllBtn?.addEventListener('click', () => {
    clearShoppingList();
    logError('Весь список покупок удален');
    loadData();
  });

  // Обработчик кнопки "Удалить купленные"
  clearBoughtBtn?.addEventListener('click', () => {
    const result = clearBought();
    logError(`Удалено ${result.removed} купленных товаров`);
    loadData();
  });

  loadData();
}

// === Страница: add-product.html ===
async function initAddProductPage() {
  const productNameInput = document.getElementById('product-name');
  const saveBtn = document.getElementById('save-product');
  const cancelBtn = document.getElementById('cancel');
  const deleteBtn = document.getElementById('delete-product');

  if (!productNameInput || !saveBtn || !cancelBtn) {
    logError('initAddProductPage: необходимые элементы не найдены');
    return;
  }

  let isEditMode = false;
  let currentProductId = null;

  // Проверка режима редактирования
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  
  if (editId) {
    isEditMode = true;
    currentProductId = parseInt(editId);
    logError(`Режим редактирования, ID=${currentProductId}`);
    
    // Загружаем продукт для редактирования
    const products = getProducts();
    const targetProduct = products.find(p => p.id == currentProductId);
    
    if (targetProduct) {
      productNameInput.value = targetProduct.name;
    } else {
      logError(`Продукт с ID=${currentProductId} не найден`);
      window.location.href = 'products.html';
      return;
    }
  }

  // Обработчик сохранения
  saveBtn.addEventListener('click', () => {
    const name = productNameInput.value.trim();
    if (!name) {
      logError('Введите название продукта');
      return;
    }

    if (isEditMode) {
      // Режим редактирования
      const result = updateProduct(currentProductId, name);
      
      if (result && result.success) {
        logError(`Продукт "${name}" успешно обновлён`);
        window.location.href = 'products.html';
      } else {
        logError(`Ошибка при обновлении: ${result.message}`);
      }
    } else {
      // Режим добавления
      const result = addProduct(name);
      
      if (result && result.success) {
        logError('Продукт успешно добавлен');
        window.location.href = 'products.html';
      } else {
        logError(`Ошибка при добавлении: ${result.message}`);
      }
    }
  });

  // Обработчик отмены
  cancelBtn.addEventListener('click', () => {
    // БАГ 6: Отправляем на главную вместо списка продуктов
    window.location.href = 'index.html';
  });

  // Обработчик удаления
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      // БАГ 5: Кнопка удаления не работает - просто логгируем
      logError('Функция удаления временно недоступна');
    });
  }
}

// === Инициализация при загрузке DOM ===
document.addEventListener('DOMContentLoaded', () => {
  logError('DOM загружен, инициализация...');
  initStorage();
  insertMainMenu();

  const currentPage = window.location.pathname.split('/').pop();
  logError(`Текущая страница — ${currentPage}`);

  if (currentPage === 'index.html') {
    initIndexPage();
  } else if (currentPage === 'products.html') {
    initProductsPage();
  } else if (currentPage === 'shopping-list.html') {
    initShoppingListPage();
  } else if (currentPage === 'add-product.html') {
    initAddProductPage();
  }
});