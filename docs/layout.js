// Основная функция, которая запускается при загрузке DOM
document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  try {
    await loadResources(); // (1) Ждём загрузки
    initLayout();          // (2) Запускаем инициализацию
  } catch (error) {
    handleError(error);    // (3) Обрабатываем ошибки
  }
}

async function loadResources() {
  const resources = [
    { type: 'css', url: 'layout.css' }, 
    { type: 'js', url: 'prism.js' }
  ];

  // Создаем массив промисов для каждого ресурса
  const loadPromises = resources.map(resource => {
    return new Promise(async (resolve) => {
      try {
        await loadSingleResource(resource);
        resolve();
      } catch (error) {
        console.warn(`Ошибка загрузки ${resource.type}: ${resource.url}`);
        resolve(); // Все равно резолвим, чтобы не блокировать загрузку
      }
    });
  });

  // Ждем загрузки всех ресурсов
  await Promise.all(loadPromises);
}

async function loadSingleResource(resource) {
  return new Promise((resolve, reject) => {
    const element = createResourceElement(resource);
    
    element.onload = () => resolve();
    element.onerror = () => reject();
    
    document.head.appendChild(element);
  });
}

function createResourceElement(resource) {
  let element;
  
  if (resource.type === 'css') {
    element = document.createElement('link');
    element.rel = 'stylesheet';
    element.href = resource.url;
  } else {
    element = document.createElement('script');
    element.src = resource.url;
  }

  return element;
}

function initLayout() {
  replaceLayoutTags();
  initMenuToggle();
  initSubmenus();
  initResizableSidebar();

  window.dispatchEvent(new Event('layout-ready'));  
}

function replaceLayoutTags() {
  const layout = document.querySelector("my-layout");
  layout.outerHTML = createLayoutTemplate(layout.innerHTML.trim());
}

function createLayoutTemplate(content) {
  const sidebar = createSidebarMenu();
  const pageTitle = document.title; // Получаем содержимое тега title
  return `
    <div class="layout-page">
      <header class="layout-header">
        <div class="header-left">
          <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar" aria-expanded="true">
          ✕
          </button>
        </div>
        <div class="header-center">
          <span class="logo">${pageTitle}</span>
        </div>
        <nav class="header-right">
          <a href="index.html">Главная</a>
          <a href="about.html">Обо мне</a>
        </nav>
      </header>
      <div class="layout-content">
        <aside class="layout-sidebar" id="sidebar">
          ${sidebar}
        </aside>
        <main class="layout-main">
          ${content}
        </main>
      </div>
      <footer class="layout-footer">
        <div class="footer-left"></div>
        <div class="footer-center">
          <p>&copy; 2025 <a href="https://t.me/sergeyslesarev">Сергей Слесарев</a></p>
        </div>
        <div class="footer-right">
          <div class="controls"></div>
        </div>
      </footer>
    </div>
  `;
}

function createSidebarMenu() {
  return `
    <nav class="sidebar-menu">
      <ul>
        <li class="menu-group">
          <a href="#" class="menu-item" aria-haspopup="true">Учебные приложения</a>
          <ul class="submenu">
            <li><a href="cases/pizza">Сайт пиццерии</a></li>
            <li><a href="cases/slflights">Бронирование авиабилетов</a></li>
          </ul>
        </li>
        <li class="menu-group">
          <a href="#" class="menu-item" aria-haspopup="true">Презентации</a>
          <ul class="submenu">
            <li><a href="https://docs.google.com/presentation/d/1RCpkEd-DjHJP4QNoZdFqBxDClW02Ow_yBSzy74J4kWo">Мастер-класс "Тестирование ПО"</a></li>
            <li><a href="https://docs.google.com/presentation/d/14ihpc5alCsaTNMydtMgWvVA2A1i6rYN7fri6BnPE82I">Ручное тестирование</a></li>
            <li><a href="https://docs.google.com/presentation/d/1SNiRk7-ahiT_Jwy6fhGEW_M9ANTk-LZ1-umVQgDUhMU">Автотестирование (Java)</a></li>
          </ul>
        </li>
        <li class="menu-group">
          <a href="#" class="menu-item" aria-haspopup="true">Страницы</a>
          <ul class="submenu">
            <li><a href="index.html">Главная</a></li>
            <li><a href="about.html">Обо мне</a></li>
          </ul>
        </li>
      </ul>
    </nav>
  `;
}

function initMenuToggle() {
  document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const isHidden = sidebar.classList.toggle('hidden');

  toggleBtn.textContent = isHidden ? '☰' : '✕';
  
  toggleBtn.setAttribute('aria-expanded', !isHidden);
}

function initSubmenus() {
  // 1. Находим элементы меню
  const menuItemList = document.querySelectorAll('.menu-group > .menu-item');
  
  // 2. Навешиваем обработчики
  menuItemList.forEach(function(menuItem) {
    menuItem.addEventListener('click', handleMenuItemClick);
  });
}

// 3. Обработчик клика
function handleMenuItemClick(event) {
  event.preventDefault();
  const submenu = this.nextElementSibling;
  
  if (submenu && submenu.classList.contains('submenu')) {
    submenu.classList.toggle('active');
    this.parentElement.classList.toggle('active'); // Важно: добавляем .active к .menu-group
  }
}


function initResizableSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const resizer = document.createElement('div');
  resizer.className = 'layout-sidebar-resizer';
  sidebar.appendChild(resizer);

  let startX, startWidth;

  resizer.addEventListener('mousedown', function(e) {
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    
    // Создаем временную границу
    const activeBorder = document.createElement('div');
    activeBorder.className = 'layout-sidebar-resizer-active';
    activeBorder.style.right = (sidebar.offsetWidth - e.offsetX) + 'px';
    sidebar.appendChild(activeBorder);
    
    sidebar.classList.add('layout-sidebar-resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function handleMouseMove(e) {
      const newWidth = startWidth + (e.clientX - startX);
      const clampedWidth = Math.max(50, Math.min(600, newWidth));
      sidebar.style.width = clampedWidth + 'px';
      activeBorder.style.right = '0';
    }

    function handleMouseUp() {
      sidebar.removeChild(activeBorder);
      sidebar.classList.remove('layout-sidebar-resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
    e.preventDefault();
  });
}


function handleError(error) {
  console.error('Ошибка при инициализации приложения:', error);
}