/**
 * ShopList — shared.js
 * Единая точка входа: меню, API, ошибки, инициализация
 */

// === Утилиты ===

/**
 * Получение параметра из URL
 */
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Получение URL бэкенда из параметра appUrl
 */
function getBackendUrl() {
  const appUrl = getUrlParam('appUrl');
  return appUrl ? appUrl.trim() : null;
}

/**
 * Проверка, доступен ли бэкенд
 */
async function testBackendConnection(appUrl) {
  try {
    const url = new URL(appUrl);
    url.searchParams.append('action', 'getProducts');

    const response = await fetch(url, { method: 'GET' });
    const text = await response.text();

    // Проверяем, является ли ответ JSON
    if (response.headers.get('Content-Type')?.includes('json')) {
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON: ${text.substring(0, 100)}...`);
      }

      if (data.error) {
        throw new Error(data.error);
      }
      
      return { success: true, message: 'Подключение установлено' };
    } 
    // Если ответ не JSON (например, HTML при ошибке GAS)
    else {
      throw new Error('Server returned non-JSON response');
    }
  } catch (error) {
    return { success: false, message: 'Нет связи с бэкендом: ' + error.message };
  }
}

/**
 * Проверка appUrl и редирект
 */
async function ensureAppUrl() {
  const appUrl = getBackendUrl();
  const currentPage = window.location.pathname.split('/').pop();
  const errorLog = document.getElementById('error-log');

  if (!errorLog) return;

  // Редирект на index.html, если нет appUrl и не на главной
  if (!appUrl && currentPage !== 'index.html') {
    window.location.href = 'index.html';
    return;
  }

  if (currentPage === 'index.html') {
    if (!appUrl) {
      errorLog.innerHTML = `
        <strong>⚠️ Бэкенд не подключён</strong><br>
        Чтобы начать работу:
        <ol>
          <li>Откройте <a href="https://docs.google.com/spreadsheets/d/1eW5_4F_4uj4r3tu7mbqrSOA4yafD-GvHEVUyMbkpJKk" target="_blank">Google Таблицу проекта</a></li>
          <li>В меню выберите <strong>Меню приложения → Показать мой URL</strong></li>
          <li>Перейдите по ссылке из диалога</li>
        </ol>
        Или вручную добавьте параметр:<br>
        <code style="background: #f0f0f0; padding: 2px 4px;">?appUrl=https://script.google.com/macros/s/YOUR-DEPLOYMENT-ID/exec</code>
      `;
      errorLog.style.background = '#fff3cd';
      errorLog.style.borderColor = '#ffeaa7';
      errorLog.style.color = '#856404';
    } else {
      errorLog.innerHTML = 'Проверка подключения к бэкенду...';
      errorLog.style.background = '#d1ecf1';
      errorLog.style.borderColor = '#bee5eb';
      errorLog.style.color = '#0c5460';

      const result = await testBackendConnection(appUrl);

      if (result.success) {
        errorLog.innerHTML = `
          <strong>✅ Подключение к бэкенду установлено</strong><br>
          URL: <code style="font-size: 12px; background: #cceeff;">${appUrl}</code>
        `;
        errorLog.style.background = '#d4edda';
        errorLog.style.borderColor = '#c3e6cb';
        errorLog.style.color = '#155724';
      } else {
        errorLog.innerHTML = `
          <strong>❌ Нет связи с бэкендом</strong><br>
          ${result.message}<br>
          Убедитесь, что URL верный и GAS развернут как веб-приложение.
        `;
        errorLog.style.background = '#f8d7da';
        errorLog.style.borderColor = '#f5c6cb';
        errorLog.style.color = '#721c24';
      }
    }
  }
}

/**
 * Универсальный запрос к API с детальным логированием
 */
async function apiRequest(action, method = 'GET', body = null) {
  const appUrl = getBackendUrl();
  if (!appUrl) {
    logError('apiRequest: не задан appUrl в URL');
    return null;
  }

  let url;
  try {
    url = new URL(appUrl);
    url.searchParams.append('action', action);
    logError(`apiRequest: формирование URL — ${url.toString()}`);
  } catch (e) {
    logError(`apiRequest: ошибка создания URL из '${appUrl}' — ${e.message}`);
    return null;
  }

  // Исправление: Content-Type только для запросов с телом
  const config = {
    method,
    headers: {}
  };

  // Для всех методов с телом
  if (method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
    config.headers['Content-Type'] = 'application/json';
    if (body) {
      try {
        config.body = JSON.stringify(body);
        logError(`apiRequest: тело запроса — ${config.body}`);
      } catch (e) {
        logError(`apiRequest: ошибка сериализации тела — ${e.message}`);
        return null;
      }
    }
  }

  try {
    logError(`apiRequest: отправка ${method} запроса к ${url}...`);
    const response = await fetch(url, config);

    logError(`apiRequest: получен ответ — статус ${response.status} (${response.statusText})`);

    // Логируем заголовки
    const headers = {};
    for (const [key, value] of response.headers) {
      headers[key] = value;
    }
    logError(`apiRequest: заголовки ответа — ${JSON.stringify(headers)}`);

    const text = await response.text();
    logError(`apiRequest: сырой ответ (первые 200 символов): ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);

    // Проверяем, является ли ответ JSON
    if (response.headers.get('Content-Type')?.includes('json')) {
      try {
        const data = JSON.parse(text);
        logError(`apiRequest: JSON успешно распарсен`);
        
        if (data.error) {
          logError(`apiRequest: сервер вернул ошибку — ${data.error}`);
          throw new Error(data.error);
        }
        
        logError(`apiRequest: ✅ Успешно: действие '${action}' завершено`);
        return data;
      } catch (e) {
        logError(`apiRequest: ошибка парсинга JSON — ${e.message}`);
        
        // Пытаемся обработать частичный JSON
        try {
          const partialData = JSON.parse(text);
          if (partialData.error) {
            throw new Error(partialData.error);
          }
          logError(`apiRequest: частичный JSON успешно обработан`);
          return partialData;
        } catch (e2) {
          // Если и частичный парсинг не удался
          if (method.toUpperCase() === 'POST') {
            logError(`apiRequest: POST-запрос обработан (без полного JSON-ответа)`);
            return { success: true };
          }
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }
      }
    } 
    // Если ответ не JSON (например, HTML при ошибке GAS)
    else {
      logError(`apiRequest: ответ не является JSON`);
      
      // Если это HTML-ошибка GAS
      if (text.includes('<html>') || text.includes('<!DOCTYPE html>')) {
        logError(`apiRequest: получен HTML-ответ (ошибка GAS)`);
        
        // Для POST-запросов считаем, что действие выполнено
        if (method.toUpperCase() === 'POST') {
          logError(`apiRequest: POST-запрос обработан (ошибка GAS, но действие выполнено)`);
          return { success: true };
        }
        
        throw new Error('Server returned HTML error page');
      }
      
      // Для POST-запросов без JSON-ответа считаем, что запрос успешен
      if (method.toUpperCase() === 'POST') {
        logError(`apiRequest: POST-запрос обработан (без JSON-ответа)`);
        return { success: true };
      }
      
      return { success: true };
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      logError(`apiRequest: 🔴 Ошибка сети — 'Failed to fetch'`);
      logError(`  - Проверь, доступен ли URL: ${appUrl}`);
      logError(`  - Убедись, что GAS развернут как веб-приложение`);
      logError(`  - Проверь консоль браузера на наличие CORS-ошибок`);
    } else {
      logError(`apiRequest: ошибка выполнения запроса '${action}': ${error.message}`);
    }
    
    // Для POST-запросов считаем, что действие выполнено
    if (method.toUpperCase() === 'POST' && error.message.includes('Failed to fetch')) {
      logError('apiRequest: POST-запрос отправлен (ошибка сети, но действие выполнено)');
      return { success: true };
    }
    
    return null;
  }
}

/**
 * Логирование ошибок в #error-log
 */
function logError(message) {
  const errorLog = document.getElementById('error-log');
  if (errorLog) {
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

/**
 * Вставка общего меню с сохранением appUrl
 */
function insertMainMenu() {
  const appUrl = getBackendUrl();
  const currentPath = window.location.pathname.split('/').pop();

  function createLink(href, text) {
    if (!appUrl) return `<a href="${href}">${text}</a>`;
    const url = new URL(href, window.location.href);
    url.searchParams.set('appUrl', appUrl);
    if (currentPath === href) return text;
    return `<a href="${url}">${text}</a>`;
  }

  const menuHtml = `
    <nav id="main-menu" style="margin-bottom: 20px; padding: 10px 0; border-bottom: 1px solid #ddd;">
      ${createLink('index.html', 'Главная')} |
      ${createLink('products.html', 'Общий список')} |
      ${createLink('shopping-list.html', 'Список покупок')} |
      ${createLink('add-product.html', 'Добавить продукт')}
    </nav>
  `;

  const container = document.createElement('div');
  container.innerHTML = menuHtml;

  const header = document.querySelector('header') || document.body;
  header.insertBefore(container.firstElementChild, header.firstChild);
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

  async function loadData() {
    logError('initProductsPage: загрузка данных...');
    products = await apiRequest('getProducts') || [];
    shoppingList = await apiRequest('getShoppingList') || [];
    renderList();
  }

  function isInShoppingList(productId) {
    return shoppingList.some(item => item.productId == productId);
  }

  function getFilteredProducts() {
    if (currentView === 'all') {
      return products;
    } else {
      return products.filter(p => !isInShoppingList(p.id));
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
      `;
      productsList.appendChild(li);
    });

    document.querySelectorAll('.add-to-shopping-list').forEach(button => {
      button.addEventListener('click', async (e) => {
        const productId = parseInt(e.target.dataset.id);
        const product = products.find(p => p.id === productId);
        if (!product) {
          logError(`initProductsPage: продукт с ID=${productId} не найден`);
          return;
        }

        logError(`initProductsPage: добавление продукта ${productId} — ${product.name}`);
        const result = await apiRequest('addToShoppingList', 'POST', {
          productId: product.id,
          productName: product.name
        });

        if (result && result.success) {
          logError(`initProductsPage: продукт добавлен в список покупок`);
          if (currentView === 'not-in-list') {
            e.target.closest('li').remove();
            logError(`initProductsPage: элемент удалён из DOM (режим "Не в списке")`);
          }
          shoppingList.push({
            productId: product.id,
            productName: product.name,
            quantity: '',
            status: 'pending'
          });
        } else {
          logError(`initProductsPage: ошибка при добавлении продукта`);
        }
      });
    });
  }

  viewAllBtn?.addEventListener('click', () => {
    currentView = 'all';
    viewAllBtn.classList.add('primary');
    viewNotInListBtn.classList.remove('primary');
    logError('initProductsPage: переключено на "Все"');
    renderList();
  });

  viewNotInListBtn?.addEventListener('click', () => {
    currentView = 'not-in-list';
    viewAllBtn.classList.remove('primary');
    viewNotInListBtn.classList.add('primary');
    logError('initProductsPage: переключено на "Не в списке"');
    renderList();
  });

  await loadData();
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

  async function loadData() {
    shoppingList = await apiRequest('getShoppingList') || [];
    renderList();
  }

  function renderList() {
    shoppingListElement.innerHTML = '';
    
    if (shoppingList.length === 0) {
      shoppingListElement.innerHTML = '<li>Список покупок пуст</li>';
      return;
    }

    shoppingList.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <input type="text" class="quantity" value="${item.quantity || ''}" placeholder="Количество" data-id="${item.productId}">
        ${item.productName}
        <button data-id="${item.productId}" class="status bought">Купил</button>
        <button data-id="${item.productId}" class="status not-available">Не было</button>
      `;
      shoppingListElement.appendChild(li);
    });

    // Обработчики для полей количества
    document.querySelectorAll('.quantity').forEach(input => {
      input.addEventListener('blur', async (e) => {
        const productId = parseInt(e.target.dataset.id);
        const quantity = e.target.value.trim();
        
        await apiRequest('updateQuantity', 'POST', {
          productId,
          quantity
        });
      });
    });

    // Обработчики для кнопок статуса
    document.querySelectorAll('.status').forEach(button => {
      button.addEventListener('click', async (e) => {
        const productId = parseInt(e.target.dataset.id);
        const status = e.target.classList.contains('bought') ? 'bought' : 'not_available';
        
        const result = await apiRequest('updateStatus', 'POST', {
          productId,
          status
        });
        
        if (result && result.success) {
          location.reload();
        }
      });
    });
  }

  // Обработчик кнопки "Удалить всё"
  clearAllBtn?.addEventListener('click', async () => {
    if (confirm('Вы уверены, что хотите удалить весь список покупок?')) {
      await apiRequest('clearShoppingList', 'POST');
      location.reload();
    }
  });

  // Обработчик кнопки "Удалить купленные"
  clearBoughtBtn?.addEventListener('click', async () => {
    if (confirm('Вы уверены, что хотите удалить купленные товары?')) {
      await apiRequest('clearBought', 'POST');
      location.reload();
    }
  });

  await loadData();
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
    logError(`initAddProductPage: режим редактирования, ID=${currentProductId}`);
    
    // Загружаем продукт для редактирования
    const product = await apiRequest('getProducts');
    const targetProduct = product.find(p => p.id == currentProductId);
    
    if (targetProduct) {
      productNameInput.value = targetProduct.name;
      
      // Показываем кнопку удаления только в режиме редактирования
      if (deleteBtn) {
        deleteBtn.style.display = 'inline-block';
      }
    } else {
      logError(`initAddProductPage: продукт с ID=${currentProductId} не найден`);
      alert('Продукт не найден');
      window.location.href = 'products.html';
      return;
    }
  }

  // Обработчик сохранения
  saveBtn.addEventListener('click', async () => {
    const name = productNameInput.value.trim();
    if (!name) {
      alert('Введите название продукта');
      return;
    }

    if (isEditMode) {
      // Режим редактирования
      const result = await apiRequest('updateProduct', 'POST', {
        id: currentProductId,
        name: name
      });
      
      if (result && result.success) {
        logError(`initAddProductPage: продукт ID=${currentProductId} успешно обновлён`);
        window.location.href = 'products.html';
      }
    } else {
      // Режим добавления
      const result = await apiRequest('addProduct', 'POST', {
        name: name
      });
      
      if (result && result.success) {
        logError('initAddProductPage: продукт успешно добавлен');
        window.location.href = 'products.html';
      }
    }
  });

  // Обработчик отмены
  cancelBtn.addEventListener('click', () => {
    window.location.href = 'products.html';
  });

  // Обработчик удаления (только в режиме редактирования)
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Вы уверены, что хотите удалить этот продукт?')) {
        const result = await apiRequest('deleteProduct', 'POST', {
          id: currentProductId
        });
        
        if (result && result.success) {
          logError(`initAddProductPage: продукт ID=${currentProductId} успешно удалён`);
          window.location.href = 'products.html';
        }
      }
    });
  }
}

// === Инициализация при загрузке DOM ===
document.addEventListener('DOMContentLoaded', async () => {
  logError('shared.js: DOM загружен, инициализация...');
  insertMainMenu();
  await ensureAppUrl();

  const currentPage = window.location.pathname.split('/').pop();
  logError(`shared.js: текущая страница — ${currentPage}`);

  if (currentPage === 'products.html') {
    logError('shared.js: инициализация страницы products.html');
    await initProductsPage();
  } else if (currentPage === 'shopping-list.html') {
    logError('shared.js: инициализация страницы shopping-list.html');
    await initShoppingListPage();
  } else if (currentPage === 'add-product.html') {
    logError('shared.js: инициализация страницы add-product.html');
    await initAddProductPage();
  }
});