// python.js - Функции для работы с Python-страницей
function initCodeBlocks() {
    console.log('Инициализация блоков кода...');
    const codeBlocks = document.querySelectorAll('.code-block, .command-line');
    
    codeBlocks.forEach(block => {
        if (block.dataset.initialized) return;
        block.dataset.initialized = 'true';
        
        const container = document.createElement('div');
        container.className = 'code-block-container';
        
        block.parentNode.insertBefore(container, block);
        container.appendChild(block);
        
        const controls = document.createElement('div');
        controls.className = 'code-controls';
        
        const buttons = [
            { text: '+', title: 'Увеличить шрифт', action: () => adjustFontSize(block, 1) },
            { text: '-', title: 'Уменьшить шрифт', action: () => adjustFontSize(block, -1) },
            { text: 'Ж', title: 'Переключить жирный шрифт', action: () => toggleFontWeight(block) },
            { text: 'Копировать', title: 'Копировать в буфер обмена', action: () => copyCodeToClipboard(block) }
        ];
        
        buttons.forEach(btnConfig => {
            const btn = document.createElement('button');
            btn.className = 'code-control-btn';
            btn.textContent = btnConfig.text;
            btn.title = btnConfig.title;
            btn.addEventListener('click', btnConfig.action);
            controls.appendChild(btn);
        });
        
        container.insertBefore(controls, block);
    });
}

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
                setTimeout(() => btn.textContent = originalText, 2000);
            }
        })
        .catch(err => console.error('Ошибка копирования:', err));
}

// Инициализация будет вызвана после полной загрузки layout.js
document.addEventListener('DOMContentLoaded', function() {
    // Небольшая задержка для гарантии, что layout.js завершил свою работу
    setTimeout(initCodeBlocks, 100);
});