// layout.js
document.addEventListener("DOMContentLoaded", () => {
  const loadResources = () => {
    return new Promise((resolve) => {
      // Определяем текущую страницу
      const path = window.location.pathname;
      const isPythonPage = path.includes('python.html');

      // Базовые стили и скрипты (всегда)
      const styles = ['layout.css'];
      const scripts = [];

      // Добавляем python-ресурсы только на странице python.html
      if (isPythonPage) {
        styles.push('python.css');
        scripts.push('python.js');
      }

      let loaded = 0;
      const total = styles.length + scripts.length;

      const checkLoaded = () => {
        loaded++;
        if (loaded === total) {
          resolve();
        }
      };

      // Загрузка стилей
      styles.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        link.onload = checkLoaded;
        link.onerror = () => {
          console.warn(`Не удалось загрузить CSS: ${href}`);
          checkLoaded(); // Продолжаем, даже если ошибка
        };
      });

      // Загрузка скриптов
      scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
        script.onload = checkLoaded;
        script.onerror = () => {
          console.error(`Не удалось загрузить JS: ${src}`);
          checkLoaded();
        };
      });

      // Если нет ресурсов для загрузки — сразу resolve
      if (total === 0) resolve();
    });
  };

  const initLayout = () => {
    const layouts = document.querySelectorAll("my-layout");
    layouts.forEach(layout => {
      const content = layout.innerHTML.trim();
      const template = `
        <div class="layout-page">
          <header class="layout-header">
            <div class="header-left">
              <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar" aria-expanded="true">✕</button>
            </div>
            <div class="header-center">
              <span class="logo">Мой сайт</span>
            </div>
            <nav class="header-right">
              <a href="index.html">Главная</a>
              <a href="about.html">О нас</a>
              <a href="python.html">Python</a>
            </nav>
          </header>
          <div class="layout-content">
            <aside class="layout-sidebar" id="sidebar">
              <nav class="sidebar-menu">
                <ul>
                  <li class="menu-group">
                    <a href="#" class="menu-item" aria-haspopup="true">Продукция</a>
                    <ul class="submenu">
                      <li><a href="#">Телефоны</a></li>
                      <li><a href="#">Ноутбуки</a></li>
                      <li><a href="#">Аксессуары</a></li>
                    </ul>
                  </li>
                  <li class="menu-group">
                    <a href="#" class="menu-item" aria-haspopup="true">Услуги</a>
                    <ul class="submenu">
                      <li><a href="#">Ремонт</a></li>
                      <li><a href="#">Обслуживание</a></li>
                      <li><a href="#">Консультации</a></li>
                    </ul>
                  </li>
                  <li class="menu-group">
                    <a href="#" class="menu-item" aria-haspopup="true">Поддержка</a>
                    <ul class="submenu">
                      <li><a href="#">FAQ</a></li>
                      <li><a href="#">Документация</a></li>
                      <li><a href="#">Форум</a></li>
                    </ul>
                  </li>
                </ul>
              </nav>
            </aside>
            <main class="layout-main">
              ${content ? content : '<p>Контент не найден.</p>'}
            </main>
          </div>
          <footer class="layout-footer">
            <p>&copy; 2025 <a href="https://t.me/sergeyslesarev">Сергей Слесарев</a></p>
          </footer>
        </div>
      `;
      layout.outerHTML = template;
    });

    // Инициализация выпадающих меню
    initMenuToggle();
  };

  const initMenuToggle = () => {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = sidebar.classList.toggle('hidden');
        toggleBtn.textContent = isHidden ? '☰' : '✕';
        toggleBtn.setAttribute('aria-expanded', !isHidden);
      });
    }

    // Логика для выпадающих подменю
    document.querySelectorAll('.menu-group > .menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const submenu = item.nextElementSibling;
        if (submenu && submenu.classList.contains('submenu')) {
          submenu.classList.toggle('active');
        }
      });
    });
  };

  // Запуск всех функций с ожиданием загрузки ресурсов
  loadResources().then(() => {
    initLayout();

    // После инициализации макета — проверяем, нужна ли инициализация Python-блоков
    if (window.location.pathname.includes('python.html') && typeof initCodeBlocks === 'function') {
      // Даем время на рендеринг DOM после initLayout
      setTimeout(initCodeBlocks, 100);
    }
  });
});