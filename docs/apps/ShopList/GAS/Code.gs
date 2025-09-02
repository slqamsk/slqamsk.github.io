// ГЛОБАЛЬНАЯ КОНСТАНТА - ВРУЧНУЮ ПРОПИШИ СВОЙ URL РАЗВЕРТЫВАНИЯ
const DEPLOYMENT_URL = 'https://script.google.com/macros/s/AKfycbzIN3HxtFViYrl5DHIUMVM-GxeNQubLxGP4-NgqxVZJv7mW5kYpdr4Q7UN9FPW4DOSA/exec';

// Имена листов
const SHEET_PRODUCTS = 'Products';
const SHEET_SHOPPING_LIST = 'ShoppingList';

/**
 * Основной обработчик HTTP-запросов
 */
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  console.log('Running handleRequest v2 - with fixed sendError');
  const action = e.parameter.action || (e.postData ? JSON.parse(e.postData.contents)?.action : null);

  try {
    switch (action) {
      case 'getProducts':
        return sendJson(getProducts());
      case 'getShoppingList':
        return sendJson(getShoppingList());
      case 'addProduct':
        return sendJson(addProduct(JSON.parse(e.postData.contents).name));
      case 'getProductById':
        const getData = JSON.parse(e.postData.contents);
        return sendJson(getProductById(getData.id));
      case 'updateProduct':
        const updateData = JSON.parse(e.postData.contents);
        return sendJson(updateProduct(updateData.id, updateData.name));
      case 'deleteProduct':
        const deleteData = JSON.parse(e.postData.contents);
        return sendJson(deleteProduct(deleteData.id));
      case 'addToShoppingList':
        const addData = JSON.parse(e.postData.contents);
        return sendJson(addToShoppingList(addData.productId, addData.productName));
      case 'updateQuantity':
        const qtyData = JSON.parse(e.postData.contents);
        return sendJson(updateQuantity(qtyData.productId, qtyData.quantity));
      case 'updateStatus':
        const statusData = JSON.parse(e.postData.contents);
        return sendJson(updateStatus(statusData.productId, statusData.status));
      case 'clearShoppingList':
        return sendJson(clearShoppingList());
      case 'clearBought':
        return sendJson(clearBought());
      default:
        return sendError('Unknown action', 400);
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return sendError('Server error: ' + error.message, 500);
  }
}

// ————————————————————
// Работа с Products
// ————————————————————

function getProducts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRODUCTS);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  return data.map(row => ({
    id: row[0],
    name: row[1]
  }));
}

function addProduct(name) {
  if (!name || name.trim() === '') {
    return { success: false, message: 'Name is required' };
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRODUCTS);
  const data = sheet.getDataRange().getValues();
  const lastId = data.length > 1 ? Math.max(...data.slice(1).map(r => r[0])) : 0;

  sheet.appendRow([lastId + 1, name.trim()]);
  return { success: true, id: lastId + 1 };
}

// Получение одного продукта
function getProductById(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRODUCTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      return {
        success: true,
        product: {
          id: data[i][0],
          name: data[i][1]
        }
      };
    }
  }
  
  return { 
    success: false, 
    message: 'Product not found' 
  };
}


function updateProduct(id, name) {
  if (!id || !name || name.trim() === '') {
    return { success: false, message: 'ID and name are required' };
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRODUCTS);
  const data = sheet.getDataRange().getValues();

  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 2).setValue(name.trim());
      found = true;
      break;
    }
  }

  return found ? { success: true } : { success: false, message: 'Product not found' };
}

function deleteProduct(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRODUCTS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: 'Product not found' };
}

// ————————————————————
// Работа с ShoppingList
// ————————————————————

function getShoppingList() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SHOPPING_LIST);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  return data.map(row => ({
    productId: row[0],
    productName: row[1],
    quantity: row[2] || '',
    status: row[3] || 'pending'
  }));
}

function addToShoppingList(productId, productName) {
  if (!productId || !productName) {
    return { success: false, message: 'Product ID and name required' };
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SHOPPING_LIST);
  const data = sheet.getDataRange().getValues();

  // Проверяем, есть ли уже такой ProductID
  for (const row of data) {
    if (row[0] == productId) {
      return { success: false, message: 'Already in shopping list' };
    }
  }

  sheet.appendRow([productId, productName, '', 'pending']);
  return { success: true };
}

function updateQuantity(productId, quantity) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SHOPPING_LIST);
  const data = sheet.getDataRange().getValues();

  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == productId) {
      sheet.getRange(i + 1, 3).setValue(quantity || '');
      found = true;
      break;
    }
  }

  return found ? { success: true } : { success: false, message: 'Not found' };
}

function updateStatus(productId, status) {
  if (!['bought', 'not_available'].includes(status)) {
    return { success: false, message: 'Invalid status' };
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SHOPPING_LIST);
  const data = sheet.getDataRange().getValues();

  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == productId) {
      sheet.getRange(i + 1, 4).setValue(status);
      found = true;
      break;
    }
  }

  return found ? { success: true } : { success: false, message: 'Not found' };
}

function clearShoppingList() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SHOPPING_LIST);
  const rows = sheet.getDataRange().getNumRows();
  if (rows > 1) sheet.deleteRows(2, rows - 1);
  return { success: true };
}

function clearBought() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SHOPPING_LIST);
  const data = sheet.getDataRange().getValues();

  const header = data[0];
  const filtered = [header];
  const toDelete = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === 'bought') {
      toDelete.push(i + 1);
    } else {
      filtered.push(data[i]);
    }
  }

  // Удаляем с конца, чтобы не сбить индексы
  toDelete.reverse().forEach(row => sheet.deleteRow(row));
  return { success: true, removed: toDelete.length };
}

// ————————————————————
// Утилиты
// ————————————————————

function sendJson(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendError(message, code = 500) {
  // setStatusCode не поддерживается → игнорируем код
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ————————————————————
// Меню в Google Таблице
// ————————————————————

function showAppUrl() {
  var frontendUrl = "https://slqamsk.github.io/apps/ShopList/v01/index.html?appUrl=" + DEPLOYMENT_URL;
  
  var html = HtmlService.createHtmlOutput(
    '<div style="padding: 20px; text-align: center;">' +
    '<h3>Ваша ссылка для работы</h3>' +
    '<p><a href="' + frontendUrl + '" target="_blank" style="font-size: 14px; word-break: break-all;">' + frontendUrl + '</a></p>' +
    '</div>'
  ).setWidth(600).setHeight(200);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Открыть веб-приложение');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Меню приложения')
    .addItem('Показать мой URL', 'showAppUrl')
    .addToUi();
}