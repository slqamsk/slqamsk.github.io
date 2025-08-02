// layout.js
document.addEventListener("DOMContentLoaded", () => {
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

    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = sidebar.classList.toggle('hidden');
      sidebarToggle.textContent = isHidden ? '☰' : '✕';
      sidebarToggle.setAttribute('aria-expanded', !isHidden);
    });

    document.addEventListener('click', (e) => {
      if (!sidebar.classList.contains('hidden')) {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
          const submenu = item.nextElementSibling;
          if (submenu && submenu.classList.contains('submenu')) {
            const isClickInside = e.target.closest('.menu-group') === item.parentElement;
            if (!isClickInside) {
              submenu.classList.remove('active');
              item.parentElement.classList.remove('open');
            }
          }
        });
      }
    });

    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', function(e) {
        if (!e.target.parentElement.classList.contains('submenu')) {
          e.preventDefault();
          e.stopPropagation();
          const submenu = this.nextElementSibling;
          if (submenu && submenu.classList.contains('submenu')) {
            submenu.classList.toggle('active');
            this.parentElement.classList.toggle('open');
          }
        }
      });
    });
  });
});