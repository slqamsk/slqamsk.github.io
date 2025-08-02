// layout.js
document.addEventListener("DOMContentLoaded", () => {
  // Находим все элементы <my-layout>
  const layouts = document.querySelectorAll("my-layout");

  layouts.forEach(layout => {
    // Сохраняем контент (то, что внутри <my-layout>)
    const content = layout.innerHTML.trim();

    // Создаём новую разметку
    const template = `
      <div class="layout-page">
        <header class="layout-header">
          <h1>Мой сайт</h1>
          <nav>
            <a href="#">Главная</a>
            <a href="#">О нас</a>
            <a href="#">Контакты</a>
          </nav>
        </header>

        <main class="layout-main">
          ${content ? content : '<p>Контент не найден.</p>'}
        </main>

        <footer class="layout-footer">
          <p>&copy; 2025 <a href="https://t.me/sergeyslesarev">Сергей Слесарев</a></p>
        </footer>
      </div>
    `;

    // Заменяем <my-layout> на новую разметку
    layout.outerHTML = template;
  });
});
