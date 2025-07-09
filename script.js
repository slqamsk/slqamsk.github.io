// Переключение темы
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';

  // Установка текущей темы
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Установка состояния переключателя
  if (currentTheme === 'dark') {
    themeToggle.checked = true;
  }

  // Обработчик изменения темы
  themeToggle.addEventListener('change', function() {
    const newTheme = this.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Функционал для страницы JavaScript
  if (document.getElementById('count')) {
    // Счётчик
    let count = 0;
    const countElement = document.getElementById('count');
    
    document.getElementById('increment').addEventListener('click', function() {
      count++;
      countElement.textContent = count;
    });
    
    document.getElementById('decrement').addEventListener('click', function() {
      count--;
      countElement.textContent = count;
    });

    // Часы
    function updateTime() {
      const now = new Date();
      document.getElementById('current-time').textContent = 
        `Текущее время: ${now.toLocaleTimeString('ru-RU')}`;
    }
    
    setInterval(updateTime, 1000);
    updateTime();
    
    document.getElementById('update-time').addEventListener('click', updateTime);

    // Обработка формы
    const form = document.getElementById('feedback-form');
    const formResult = document.getElementById('form-result');
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      
      formResult.textContent = `Спасибо, ${name}! Ваше сообщение отправлено.`;
      formResult.style.backgroundColor = 'var(--header-bg)';
      formResult.style.color = 'white';
      
      // Очистка формы
      form.reset();
      
      // Скрываем сообщение через 5 секунд
      setTimeout(() => {
        formResult.textContent = '';
        formResult.style.backgroundColor = '';
      }, 5000);
    });
  }
});
