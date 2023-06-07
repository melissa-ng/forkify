import icons from 'url:../../img/icons.svg';
import View from './View.js';

class ShoppingListView extends View {
  _parentElement = document.querySelector('.shopping-list__list');
  _errorMessage =
    'No ingredients yet. Add some ingredients to your shopping cart :)';
  _message = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }
}

export default new ShoppingListView();
