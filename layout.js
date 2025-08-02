// layout.js
document.addEventListener("DOMContentLoaded", () => {
  const layouts = document.querySelectorAll("my-layout");

  layouts.forEach(layout => {
    const content = layout.innerHTML.trim();

    const template = `
      <div class="layout-page">
        <header class="layout-header">
          <div class="header-left">
            <button class="sidebar-toggle" id="sidebarToggle">☰</button>
          </div>
          <div class="header-center">
            <span class="logo">Мой сайт</span>
          </div>
          <nav class="header-right">
            <a href="#">Главная</a>
            <a href="#">О нас</a>
            <a href="#">Контакты</a>
          </nav>
        </header>

        <div class="layout-content">
          <aside class="layout-sidebar" id="sidebar">
            <nav class="sidebar-menu">
              <ul>
                <li class="menu-group">
                  <a href="#" class="menu-item">Продукция</a>
                  <ul class="submenu">
                    <li><a href="#">Телефоны</a></li>
                    <li><a href="#">Ноутбуки</a></li>
                    <li><a href="#">Аксессуары</a></li>
                  </ul>
                </li>
                <li class="menu-group">
                  <a href="#" class="menu-item">Услуги</a>
                  <ul class="submenu">
                    <li><a href="#">Ремонт</a></li>
                    <li><a href="#">Обслуживание</a></li>
                    <li><a href="#">Консультации</a></li>
                  </ul>
                </li>
                <li class="menu-group">
                  <a href="#" class="menu-item">Поддержка</a>
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

    // Обработчики для меню
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    // Сворачивание/разворачивание сайдбара
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('hidden');
      document.body.classList.toggle('sidebar-hidden');
      sidebarToggle.textContent = sidebar.classList.contains('hidden') ? '☰' : '✕';
    });

    // Работа с подменю
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', function(e) {
        // Открываем/закрываем подменю только при клике на пункт 1-го уровня
        if (!e.target.parentElement.classList.contains('submenu')) {
          e.preventDefault();
          e.stopPropagation();
          const submenu = this.nextElementSibling;
          submenu.classList.toggle('active');
          this.parentElement.classList.toggle('open');
        }
      });
    });

    // Обработчики для пунктов подменю (чтобы не закрывалось при клике)
    document.querySelectorAll('.submenu a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.stopPropagation(); // Предотвращаем всплытие события
      });
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
      if (!sidebar.classList.contains('hidden')) {
        // Закрываем подменю только если клик был не по меню
        if (!e.target.closest('.sidebar-menu')) {
          document.querySelectorAll('.submenu').forEach(menu => {
            menu.classList.remove('active');
            menu.parentElement.classList.remove('open');
          });
        }
      }
    });
  });
});