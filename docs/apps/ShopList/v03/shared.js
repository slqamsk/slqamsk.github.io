// Shared JavaScript for ShopList Application

// Utility functions
function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

function showError(message) {
    const errorLog = document.getElementById('error-log');
    const errorText = document.querySelector('#error-log p');
    
    if (errorLog && errorText) {
        const timestamp = getCurrentTime();
        errorText.textContent += `[${timestamp}] ${message}\n`;
        errorLog.classList.remove('hidden');
    } else {
        console.error('Error element not found:', message);
    }
}

function hideError() {
    const errorLog = document.getElementById('error-log');
    if (errorLog) {
        errorLog.classList.add('hidden');
    }
}

function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// Close error notification
document.addEventListener('click', function(e) {
    if (e.target.closest('.error-close')) {
        hideError();
    }
});

// API functions
async function apiRequest(url, method = 'GET', data = null) {
    showLoading();
    
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        
        // Check if response is HTML (error case)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            const text = await response.text();
            throw new Error('API returned HTML instead of JSON. Check your deployment URL.');
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Unknown API error');
        }
        
        return result;
    } catch (error) {
        showError(error.message);
        throw error;
    } finally {
        hideLoading();
    }
}

// App initialization
function initializeApp() {
    feather.replace();
    
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            document.querySelector('.mobile-menu').classList.toggle('hidden');
        });
    }
    
    // Handle appUrl parameter
    const urlParams = new URLSearchParams(window.location.search);
    const appUrl = urlParams.get('appUrl');
    
    if (window.location.pathname.endsWith('index.html')) {
        if (appUrl) {
            document.getElementById('deployment-instructions').classList.add('hidden');
            document.getElementById('app-status').classList.remove('hidden');
            
            // Check backend connection
            checkBackendConnection(appUrl);
        }
    } else {
        if (!appUrl) {
            window.location.href = 'index.html';
            return;
        }
    }
    
    // Update all links to include appUrl parameter
    updateLinks(appUrl);
}

// Update all links to include appUrl parameter
function updateLinks(appUrl) {
    if (!appUrl) return;
    
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('appUrl')) {
            link.setAttribute('href', href + (href.includes('?') ? '&' : '?') + 'appUrl=' + encodeURIComponent(appUrl));
        }
    });
}

// Backend connection check
async function checkBackendConnection(appUrl) {
    try {
        await apiRequest(appUrl + '?action=getProducts');
        document.getElementById('app-status').innerHTML = `
            <div class="rounded-md bg-green-50 p-4 mb-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i data-feather="check-circle" class="h-5 w-5 text-green-400"></i>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-green-800">Подключение к бэкенду установлено</h3>
                    </div>
                </div>
            </div>
        `;
        feather.replace();
    } catch (error) {
        document.getElementById('app-status').innerHTML = `
            <div class="rounded-md bg-red-50 p-4 mb-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i data-feather="x-circle" class="h-5 w-5 text-red-400"></i>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Ошибка подключения к бэкенду: ${error.message}</h3>
                    </div>
                </div>
            </div>
        `;
        feather.replace();
    }
}

// Products page functions
function initializeProductsPage() {
    feather.replace();
    
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            document.querySelector('.mobile-menu').classList.toggle('hidden');
        });
    }
    
    // Handle appUrl parameter
    const urlParams = new URLSearchParams(window.location.search);
    const appUrl = urlParams.get('appUrl');
    
    if (!appUrl) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update all links to include appUrl parameter
    updateLinks(appUrl);
    
    // Load products
    loadProducts(appUrl);
    
    // View mode change handler
    document.getElementById('view-mode').addEventListener('change', function() {
        loadProducts(appUrl);
    });
}

async function loadProducts(appUrl) {
    try {
        const viewMode = document.getElementById('view-mode').value;
        const productsResponse = await apiRequest(appUrl + '?action=getProducts');
        let products = productsResponse.products || [];
        
        if (viewMode === 'not-in-list') {
            // Get shopping list to filter out products already in list
            const shoppingListResponse = await apiRequest(appUrl + '?action=getShoppingList');
            const shoppingList = shoppingListResponse.items || [];
            const shoppingListProductIds = shoppingList.map(item => item.productId);
            
            products = products.filter(product => !shoppingListProductIds.includes(product.id));
        }
        
        renderProducts(products, appUrl, viewMode);
    } catch (error) {
        document.getElementById('products-list').innerHTML = `
            <div class="text-center py-12">
                <i data-feather="alert-triangle" class="mx-auto h-12 w-12 text-red-400"></i>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Ошибка загрузки</h3>
                <p class="mt-1 text-sm text-gray-500">${error.message}</p>
            </div>
        `;
        feather.replace();
    }
}

function renderProducts(products, appUrl, viewMode) {
    const productsList = document.getElementById('products-list');
    
    if (products.length === 0) {
        productsList.innerHTML = `
            <div class="text-center py-12">
                <i data-feather="inbox" class="mx-auto h-12 w-12 text-gray-400"></i>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Нет продуктов</h3>
                <p class="mt-1 text-sm text-gray-500">Добавьте первый продукт в общий список.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    let html = '<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">';
    
    products.forEach(product => {
        html += `
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex justify-between items-center" data-product-id="${product.id}">
                <span class="text-sm font-medium text-gray-900">${product.name}</span>
                <button class="add-to-list inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" data-product-id="${product.id}" data-product-name="${product.name}">
                    <i data-feather="plus" class="mr-1 h-4 w-4"></i> В список
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    productsList.innerHTML = html;
    feather.replace();
    
    // Add event listeners to "Add to list" buttons
    document.querySelectorAll('.add-to-list').forEach(button => {
        button.addEventListener('click', async function() {
            const productId = this.getAttribute('data-product-id');
            const productName = this.getAttribute('data-product-name');
            
            try {
                await apiRequest(appUrl + '?action=addToShoppingList', 'POST', {
                    productId: parseInt(productId),
                    productName: productName
                });
                
                // If in "not-in-list" mode, remove the product from the DOM
                if (viewMode === 'not-in-list') {
                    this.closest('[data-product-id]').remove();
                } else {
                    // Show success message
                    alert('Продукт добавлен в список покупок');
                }
            } catch (error) {
                showError('Ошибка при добавлении в список: ' + error.message);
            }
        });
    });
}

// Shopping list page functions
function initializeShoppingListPage() {
    feather.replace();
    
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            document.querySelector('.mobile-menu').classList.toggle('hidden');
        });
    }
    
    // Handle appUrl parameter
    const urlParams = new URLSearchParams(window.location.search);
    const appUrl = urlParams.get('appUrl');
    
    if (!appUrl) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update all links to include appUrl parameter
    updateLinks(appUrl);
    
    // Load shopping list
    loadShoppingList(appUrl);
    
    // Clear buttons handlers
    document.getElementById('clear-bought').addEventListener('click', function() {
        clearBoughtItems(appUrl);
    });
    
    document.getElementById('clear-all').addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите удалить весь список покупок?')) {
            clearShoppingList(appUrl);
        }
    });
}

async function loadShoppingList(appUrl) {
    try {
        const response = await apiRequest(appUrl + '?action=getShoppingList');
        const items = response.items || [];
        renderShoppingList(items, appUrl);
    } catch (error) {
        document.getElementById('shopping-list').innerHTML = `
            <div class="text-center py-12">
                <i data-feather="alert-triangle" class="mx-auto h-12 w-12 text-red-400"></i>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Ошибка загрузки</h3>
                <p class="mt-1 text-sm text-gray-500">${error.message}</p>
            </div>
        `;
        feather.replace();
    }
}

function renderShoppingList(items, appUrl) {
    const shoppingList = document.getElementById('shopping-list');
    
    if (items.length === 0) {
        shoppingList.innerHTML = `
            <div class="text-center py-12">
                <i data-feather="inbox" class="mx-auto h-12 w-12 text-gray-400"></i>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Список покупок пуст</h3>
                <p class="mt-1 text-sm text-gray-500">Добавьте продукты из общего списка.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    let html = '<div class="space-y-4">';
    
    items.forEach(item => {
        const statusClass = `status-${item.status}`;
        const statusText = getStatusText(item.status);
        
        html += `
            <div class="border border-gray-200 rounded-lg shadow-sm p-4 ${statusClass}" data-item-id="${item.productId}">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="text-sm font-medium text-gray-900">${item.productName}</h4>
                        <p class="text-xs text-gray-500 mt-1">Статус: ${statusText}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="status-btn inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" data-product-id="${item.productId}" data-status="bought">
                            Купил
                        </button>
                        <button class="status-btn inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" data-product-id="${item.productId}" data-status="not_available">
                            Не было
                        </button>
                    </div>
                </div>
                <div class="mt-3 flex">
                    <input type="text" class="quantity-input flex-1 min-w-0 block w-full px-3 py-2 text-sm border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Количество" value="${item.quantity || ''}" data-product-id="${item.productId}">
                    <button class="update-quantity inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Обновить
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    shoppingList.innerHTML = html;
    feather.replace();
    
    // Add event listeners to status buttons
    document.querySelectorAll('.status-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const productId = this.getAttribute('data-product-id');
            const status = this.getAttribute('data-status');
            
            try {
                await apiRequest(appUrl + '?action=updateStatus', 'POST', {
                    productId: parseInt(productId),
                    status: status
                });
                
                // Reload the page to show updated status
                window.location.reload();
            } catch (error) {
                showError('Ошибка при обновлении статуса: ' + error.message);
            }
        });
    });
    
    // Add event listeners to quantity update buttons
    document.querySelectorAll('.update-quantity').forEach(button => {
        button.addEventListener('click', async function() {
            const container = this.closest('[data-item-id]');
            const productId = container.getAttribute('data-item-id');
            const quantityInput = container.querySelector('.quantity-input');
            const quantity = quantityInput.value;
            
            try {
                await apiRequest(appUrl + '?action=updateQuantity', 'POST', {
                    productId: parseInt(productId),
                    quantity: quantity
                });
                
                // Reload the page to show updated quantity
                window.location.reload();
            } catch (error) {
                showError('Ошибка при обновлении количества: ' + error.message);
            }
        });
    });
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return 'Ожидание';
        case 'bought': return 'Куплено';
        case 'not_available': return 'Не было в магазине';
        default: return status;
    }
}

async function clearBoughtItems(appUrl) {
    try {
        await apiRequest(appUrl + '?action=clearBought', 'POST');
        window.location.reload();
    } catch (error) {
        showError('Ошибка при удалении купленных товаров: ' + error.message);
    }
}

async function clearShoppingList(appUrl) {
    try {
        await apiRequest(appUrl + '?action=clearShoppingList', 'POST');
        window.location.reload();
    } catch (error) {
        showError('Ошибка при очистке списка покупок: ' + error.message);
    }
}

// Add product page functions
function initializeAddProductPage() {
    feather.replace();
    
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            document.querySelector('.mobile-menu').classList.toggle('hidden');
        });
    }
    
    // Handle appUrl parameter
    const urlParams = new URLSearchParams(window.location.search);
    const appUrl = urlParams.get('appUrl');
    const editId = urlParams.get('edit');
    
    if (!appUrl) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update all links to include appUrl parameter
    updateLinks(appUrl);
    
    // Check if we're in edit mode
    if (editId) {
        document.getElementById('form-title').textContent = 'Редактировать продукт';
        document.getElementById('delete-button').classList.remove('hidden');
        loadProductForEditing(appUrl, editId);
    }
    
    // Form validation
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('product-name');
        const name = nameInput.value.trim();
        const nameError = document.getElementById('name-error');
        
        // Validate name
        if (name.length < 2 || name.length > 100 || !name.replace(/\s/g, '').length) {
            nameError.classList.remove('hidden');
            nameInput.classList.add('border-red-300');
            nameInput.classList.add('focus:ring-red-500');
            nameInput.classList.add('focus:border-red-500');
            return;
        }
        
        nameError.classList.add('hidden');
        nameInput.classList.remove('border-red-300');
        nameInput.classList.remove('focus:ring-red-500');
        nameInput.classList.remove('focus:border-red-500');
        
        // Save product
        if (editId) {
            updateProduct(appUrl, editId, name);
        } else {
            addProduct(appUrl, name);
        }
    });
    
    // Cancel button
    document.getElementById('cancel-button').addEventListener('click', function() {
        window.location.href = 'products.html?appUrl=' + encodeURIComponent(appUrl);
    });
    
    // Delete button
    document.getElementById('delete-button').addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите удалить этот продукт?')) {
            deleteProduct(appUrl, editId);
        }
    });
}

async function loadProductForEditing(appUrl, productId) {
    try {
        const response = await apiRequest(appUrl + '?action=getProductById', 'POST', {
            id: parseInt(productId)
        });
        
        const product = response.product;
        document.getElementById('product-name').value = product.name;
    } catch (error) {
        showError('Ошибка при загрузке продукта: ' + error.message);
    }
}

async function addProduct(appUrl, name) {
    try {
        await apiRequest(appUrl + '?action=addProduct', 'POST', {
            name: name
        });
        
        window.location.href = 'products.html?appUrl=' + encodeURIComponent(appUrl);
    } catch (error) {
        showError('Ошибка при добавлении продукта: ' + error.message);
    }
}

async function updateProduct(appUrl, productId, name) {
    try {
        await apiRequest(appUrl + '?action=updateProduct', 'POST', {
            id: parseInt(productId),
            name: name
        });
        
        window.location.href = 'products.html?appUrl=' + encodeURIComponent(appUrl);
    } catch (error) {
        showError('Ошибка при обновлении продукта: ' + error.message);
    }
}

async function deleteProduct(appUrl, productId) {
    try {
        await apiRequest(appUrl + '?action=deleteProduct', 'POST', {
            id: parseInt(productId)
        });
        
        window.location.href = 'products.html?appUrl=' + encodeURIComponent(appUrl);
    } catch (error) {
        showError('Ошибка при удалении продукта: ' + error.message);
    }
}
