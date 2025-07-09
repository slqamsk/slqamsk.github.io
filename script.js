// Переключение темы
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

// Устанавливаем текущую тему
document.documentElement.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Функционал для страницы JavaScript
if (document.getElementById('demo-button')) {
  document.getElementById('demo-button').addEventListener('click', () => {
    alert('Кнопка работает! Это JavaScript!');
  });

  let count = 0;
  const countElement = document.getElementById('count');
  
  document.getElementById('increment').addEventListener('click', () => {
    count++;
    countElement.textContent = count;
  });
  
  document.getElementById('decrement').addEventListener('click', () => {
    count--;
    countElement.textContent = count;
  });

  function updateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = `Текущее время: ${now.toLocaleTimeString()}`;
  }
  
  setInterval(updateTime, 1000);
  updateTime();
}
