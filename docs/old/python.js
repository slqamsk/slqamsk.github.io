// python.js - Функции для работы с Python-страницей

// === Управление темами ===
const themes = ['light', 'dark', 'github'];
let currentThemeIndex = 0;

function initCodeBlocks() {
  console.log('Инициализация блоков кода...');

  // Восстанавливаем тему
  const savedTheme = localStorage.getItem('codeTheme');
  currentThemeIndex = savedTheme && themes.includes(savedTheme) ? themes.indexOf(savedTheme) : 0;

  const codeBlocks = document.querySelectorAll('.code-block, .command-line');

  codeBlocks.forEach(block => {
    if (block.dataset.initialized) return;
    block.dataset.initialized = 'true';

    const container = document.createElement('div');
    container.className = 'code-block-wrapper'; // Новый общий контейнер

    block.parentNode.insertBefore(container, block);
    container.appendChild(block);

    const controls = document.createElement('div');
    controls.className = 'code-controls';

    // === КНОПКА "ТЕМА" ===
    const themeBtn = document.createElement('button');
    themeBtn.className = 'code-control-btn';
    themeBtn.textContent = 'ТЕМА';
    themeBtn.title = 'Переключить тему оформления кода';
    themeBtn.addEventListener('click', () => {
      cycleTheme(container, themeBtn);
    });

    controls.appendChild(themeBtn);

    // Остальные кнопки
    const buttons = [
      { text: 'КРУПНЕЙ', title: 'Увеличить шрифт', action: () => adjustFontSize(block, 1) },
      { text: 'МЕЛЬЧЕ', title: 'Уменьшить шрифт', action: () => adjustFontSize(block, -1) },
      { text: 'ЖИРНЫЙ', title: 'Переключить жирный шрифт', action: () => toggleFontWeight(block) },
      { text: 'КОПИРОВАТЬ', title: 'Копировать в буфер обмена', action: () => copyCodeToClipboard(block) }
    ];

    buttons.forEach(btnConfig => {
      const btn = document.createElement('button');
      btn.className = 'code-control-btn';
      btn.textContent = btnConfig.text;
      btn.title = btnConfig.title;
      btn.addEventListener('click', btnConfig.action);
      controls.appendChild(btn);
    });

    // Вставляем панель управления НАД блоком
    container.insertBefore(controls, block);

    // Применяем тему
    applyTheme(container, themeBtn, themes[currentThemeIndex], false);
  });
}

function cycleTheme(container, themeBtn) {
  const nextIndex = (currentThemeIndex + 1) % themes.length;
  const nextTheme = themes[nextIndex];

  // Удаляем старую тему
  container.classList.remove('theme-light', 'theme-dark', 'theme-github');
  // Добавляем новую
  container.classList.add(`theme-${nextTheme}`);

  themeBtn.textContent = nextTheme === 'light' ? 'СВЕТЛАЯ' :
                        nextTheme === 'dark' ? 'ТЁМНАЯ' : 'GITHUB';

  currentThemeIndex = nextIndex;
  localStorage.setItem('codeTheme', nextTheme);
}

function applyTheme(container, themeBtn, theme, save = true) {
  container.classList.remove('theme-light', 'theme-dark', 'theme-github');
  container.classList.add(`theme-${theme}`);

  themeBtn.textContent = theme === 'light' ? 'СВЕТЛАЯ' :
                         theme === 'dark' ? 'ТЁМНАЯ' : 'GITHUB';

  if (save) {
    localStorage.setItem('codeTheme', theme);
  }
}

// === Функции управления кодом ===
function adjustFontSize(block, change) {
  const currentSize = parseInt(window.getComputedStyle(block).fontSize) || 14;
  const newSize = Math.max(10, Math.min(24, currentSize + change));
  block.style.fontSize = `${newSize}px`;
}

function toggleFontWeight(block) {
  block.style.fontWeight = block.style.fontWeight === 'bold' ? 'normal' : 'bold';
}

function copyCodeToClipboard(block) {
  let textToCopy = block.textContent.trim();
  if (block.classList.contains('command-line')) {
    textToCopy = textToCopy.replace(/^\$\s*/, '');
  }

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      const btn = block.parentNode.querySelector('[title="Копировать в буфер обмена"]');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Скопировано!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    })
    .catch(err => console.error('Ошибка копирования:', err));
}

// === Инициализация ===
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initCodeBlocks, 100);
});