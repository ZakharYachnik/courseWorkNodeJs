// Получение формы фильтрации
const filterForm = document.getElementById('filter-form');

// Загрузка сохраненных значений фильтра из локального хранилища
const savedFilter = JSON.parse(localStorage.getItem('savedFilter'));

var flagForm = localStorage.getItem('flag');

if (savedFilter && flagForm == 1) {

  // Установка сохраненных значений в форму
  document.getElementById('make-filter').value = savedFilter.make;
  document.getElementById('model-filter').value = savedFilter.model;
  document.getElementById('year-from-filter').value = savedFilter.yearFrom;
  document.getElementById('year-to-filter').value = savedFilter.yearTo;
  document.getElementById('price-from-filter').value = savedFilter.priceFrom;
  document.getElementById('price-to-filter').value = savedFilter.priceTo;
  document.getElementById('engine-type-filter').value = savedFilter.engineType;
  document.getElementById('drive-type-filter').value = savedFilter.driveType;
  document.getElementById('currency-type-filter').value = savedFilter.currency;
  console.log("function")
  flagForm = 0
  localStorage.setItem('flag', JSON.stringify(flagForm));
}

// Обработка отправки формы фильтрации
filterForm.addEventListener('submit', function (event) {
    console.log("listner")
  // Сохранение значений фильтра в локальном хранилище
  const make = document.getElementById('make-filter').value;
  const model = document.getElementById('model-filter').value;
  const yearFrom = document.getElementById('year-from-filter').value;
  const yearTo = document.getElementById('year-to-filter').value;
  const priceFrom = document.getElementById('price-from-filter').value;
  const priceTo = document.getElementById('price-to-filter').value;
  const engineType = document.getElementById('engine-type-filter').value;
  const driveType = document.getElementById('drive-type-filter').value;
  const currency = document.getElementById('currency-type-filter').value;

  const filter = {
    make,
    model,
    yearFrom,
    yearTo,
    priceFrom,
    priceTo,
    engineType,
    driveType,
    currency,
  };

  localStorage.setItem('savedFilter', JSON.stringify(filter));
  flagForm = 1;
  localStorage.setItem('flag', JSON.stringify(flagForm));
});
