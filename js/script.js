// Отрисовка процентов в круге
$('.payment__circle').circleProgress({
  startAngle: 3 * Math.PI / 2,
  size: 42,
  lineCap: 'round',
  animation: false,
  fill: {
    color: "#81C624"
  },
  emptyFill: "rgba(232, 232, 232, 1)",
});


// Открытие и закрытие попапа
var btnClose = document.querySelector('#popup-close');
var popup = document.querySelector('#popup-payment');
var btnReturn = document.querySelector('#return');

btnClose.addEventListener('click', function() {
  popup.classList.add('popup--close');
});

btnReturn.addEventListener('click', function() {
  popup.classList.remove('popup--close');
});


// Удаляем то что ввел человек при закрытии окна поиска
var searchHeader = document.querySelector('#search-header');

searchHeader.addEventListener('blur', function() {
  searchHeader.value = '';
});