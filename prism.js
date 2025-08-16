// Подключение CSS
const styleLinks = [
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css',
  'styles.css'
];

styleLinks.forEach(href => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
});

// Подключение JS
const scriptUrls = [
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js'
];

scriptUrls.forEach(src => {
  const script = document.createElement('script');
  script.src = src;
  document.body.appendChild(script);
});

// Создание кнопок управления
function createControls() {
  const controlsContainer = document.querySelector('.controls');
  
  // Создаем контейнер для кнопок тем
  const themeButtonsContainer = document.createElement('div');
  themeButtonsContainer.className = 'theme-buttons';
  
  // Создаем кнопки тем
  const themes = [
    { name: 'Светлая', theme: 'prism', class: 'btn-theme-prism' },
    { name: 'Solarized', theme: 'prism-solarizedlight', class: 'btn-theme-solarizedlight' },
    { name: 'Coy', theme: 'prism-coy', class: 'btn-theme-coy' },
    { name: 'Okaidia', theme: 'prism-okaidia', class: 'btn-theme-okaidia' },
    { name: 'Тёмная', theme: 'prism-tomorrow', class: 'btn-theme-tomorrow' }
  ];
  
  themes.forEach(({ name, theme, class: btnClass }) => {
    const button = document.createElement('button');
    button.className = `theme-btn ${btnClass}`;
    button.textContent = name;
    button.dataset.theme = theme;
    themeButtonsContainer.appendChild(button);
  });
  
  // Создаем кнопки управления шрифтом
  const fontControls = document.createElement('div');
  fontControls.className = 'font-controls';
  
  const decBtn = document.createElement('button');
  decBtn.id = 'font-dec';
  decBtn.className = 'font-btn';
  decBtn.textContent = '−';
  
  const incBtn = document.createElement('button');
  incBtn.id = 'font-inc';
  incBtn.className = 'font-btn';
  incBtn.textContent = '+';
  
  fontControls.appendChild(decBtn);
  fontControls.appendChild(incBtn);
  
  // Добавляем все элементы в контейнер
  controlsContainer.appendChild(themeButtonsContainer);
  controlsContainer.appendChild(fontControls);
}

// Управление размером шрифта
function setupFontControls() {
  const MIN_FONT = 12;
  const MAX_FONT = 35;
  let currentSize = 18;

  const incBtn = document.getElementById('font-inc');
  const decBtn = document.getElementById('font-dec');

  function updateButtons() {
    decBtn.disabled = currentSize <= MIN_FONT;
    incBtn.disabled = currentSize >= MAX_FONT;
  }

  function updateCodeFontSize() {
    document.querySelectorAll('code').forEach(el => {
      el.style.fontSize = currentSize + 'px';
    });
  }

  incBtn.addEventListener('click', () => {
    if (currentSize < MAX_FONT) {
      currentSize++;
      updateCodeFontSize();
      updateButtons();
    }
  });

  decBtn.addEventListener('click', () => {
    if (currentSize > MIN_FONT) {
      currentSize--;
      updateCodeFontSize();
      updateButtons();
    }
  });

  updateButtons();
  updateCodeFontSize();
}

// Переключение тем
function setupThemeSwitcher() {
  const themeLink = document.createElement('link');
  themeLink.id = 'theme-link';
  themeLink.rel = 'stylesheet';
  themeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
  document.head.appendChild(themeLink);

  const themes = {
    'prism': 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css',
    'prism-solarizedlight': 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-solarizedlight.min.css',
    'prism-coy': 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-coy.min.css',
    'prism-okaidia': 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css',
    'prism-tomorrow': 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
  };

  function applyTheme(theme) {
    if (!themes[theme]) return false;
    
    themeLink.href = themes[theme];
    localStorage.setItem('prism-theme', theme);
    
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    const activeButton = document.querySelector(`[data-theme="${theme}"]`);
    if (activeButton) activeButton.classList.add('active');
    
    return true;
  }

  // Восстанавливаем сохраненную тему
  const savedTheme = localStorage.getItem('prism-theme');
  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme);
  }

  // Обработчики для кнопок тем
  document.querySelectorAll('.theme-btn').forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.dataset.theme;
      applyTheme(theme);
    });
  });
}

// Кнопки копирования
function setupCopyButtons() {
  function createCopyButton(block) {
    if (block.querySelector('.copy-button')) return;
    
    const btn = document.createElement('button');
    btn.className = 'copy-button';
    btn.textContent = 'Скопировать';
    
    btn.addEventListener('click', () => {
      if (!navigator.clipboard) {
        console.warn('Clipboard API не поддерживается');
        return;
      }
      
      const code = block.querySelector('code');
      navigator.clipboard.writeText(code.textContent.trim())
        .then(() => {
          btn.textContent = 'Скопировано!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Скопировать';
            btn.classList.remove('copied');
          }, 2000);
        })
        .catch(err => {
          console.error('Ошибка копирования:', err);
          btn.textContent = 'Ошибка!';
          setTimeout(() => {
            btn.textContent = 'Скопировать';
          }, 2000);
        });
    });
    
    block.appendChild(btn);
  }

  document.querySelectorAll('pre').forEach(block => {
    createCopyButton(block);
  });
}

// Инициализация
function initPrism() {
  createControls();
  setupFontControls();
  setupThemeSwitcher();
  setupCopyButtons();
  
  const checkPrism = setInterval(() => {
    if (window.Prism) {
      clearInterval(checkPrism);
      Prism.highlightAll();
    }
  }, 100);
}

// Ждем когда layout будет готов
window.addEventListener('layout-ready', initPrism);