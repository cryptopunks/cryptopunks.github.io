/**
 * Main JS file for Casper behaviours
 */

/*globals jQuery, document */
(function ($) {
    "use strict";

    $(document).ready(function(){

        $(".post-content").fitVids();

    });

}(jQuery));

function copyAddress(element) {
  const text = element.firstChild.textContent.trim();
  const tooltip = element.querySelector('.tooltip');

  // Выделение текста
  const range = document.createRange();
  range.selectNodeContents(element.firstChild);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Копирование
  navigator.clipboard.writeText(text).then(() => {
    element.classList.add('copied');
    tooltip.classList.add('show-tooltip');

    setTimeout(() => {
      element.classList.remove('copied');
      tooltip.classList.remove('show-tooltip');
    }, 1500);
  }).catch(err => {
    console.error('Ошибка копирования:', err);
  });
}
