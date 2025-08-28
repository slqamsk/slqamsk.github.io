/**
 * ShopList — shared.js
 * Единая точка входа: меню, проверка подключения, API, инициализация страниц
 */

// === Утилиты ===

function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function getBackendUrl() {
  return getUrlParam('appUrl');
}

// Проверка подключения к бэкенду
async function testBackendConnection(appUrl) {
  try {
    const url = new URL(appUrl);
    url.searchParams.append('action', 'getProducts');

    const response = await fetch(url, { method: 'GET', mode: 'cors' });
    const text = await response.text();

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
  } catch (error) {
    return { success: false, message: 'Нет связи с бэкендом: ' + error.message };
  }
}

// Основная проверка appUrl и статуса подключения
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

// Универсальный fetch
async function apiRequest(action, method = 'GET', body = null) {
  const appUrl = getBackendUrl();
  if (!appUrl) {
    logError('Не задан appUrl в URL');
    return null;
  }

  const url = new URL(appUrl);
  url.searchParams.append('action', action);

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    logError(`Ошибка при ${action}: ${error.message}`);
    return null;
  }
}

// Логирование ошибок
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

// Вставка меню с сохранением appUrl
function insertMainMenu() {
  const appUrl = getUrlParam('appUrl');
  const currentPath = window.location.pathname.split('/').pop();

  function createLink(href, text) {
    if (!appUrl) return `<a href="${href}">${text}</a>`;
    const url = new URL(href, window.location.href);
    url.searchParams.set('appUrl', appUrl);
    // Если уже на этой странице — не добавлять лишний раз
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

  if (!productsList) return;

  let products = [];
  let shoppingList = [];
  let currentView = 'all';

  async function loadData() {
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
        if (!product) return;

        const result = await apiRequest('addToShoppingList', 'POST', {
          productId: product.id,
          productName: product.name
        });

        if (result && result.success) {
          if (currentView === 'not-in-list') {
            e.target.closest('li').remove();
          }
          shoppingList.push({
            productId: product.id,
            productName: product.name,
            quantity: '',
            status: 'pending'
          });
        }
      });
    });
  }

  viewAllBtn?.addEventListener('click', () => {
    currentView = 'all';
    viewAllBtn.classList.add('primary');
    viewNotInListBtn.classList.remove('primary');
    renderList();
  });

  viewNotInListBtn?.addEventListener('click', () => {
    currentView = 'not-in-list';
    viewAllBtn.classList.remove('primary');
    viewNotInListBtn.classList.add('primary');
    renderList();
  });

  // Инициализация
  await loadData();
  viewAllBtn?.classList.add('primary');
}

// === Автоматическая инициализация ===
document.addEventListener('DOMContentLoaded', async () => {
  insertMainMenu();
  await ensureAppUrl(); // 🔥 Ждём завершения проверки

  const currentPage = window.location.pathname.split('/').pop();

  if (currentPage === 'products.html') {
    await initProductsPage();
  }
  // Здесь будут другие страницы: shopping-list.html, add-product.html
});