import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';
import View from './View.js';

class ShoppingCartView extends View {
  _parentElement = document.querySelector('.shopping-list__list');
  _errorMessage =
    'No ingredients yet. Add some ingredients to your shopping list :)';
  _message = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  addHandlerDeleteFromList(handler) {
    const _parentElement2 = document.querySelector(
      '.shopping-list__ingredients-only'
    );
    if (_parentElement2) {
      _parentElement2.addEventListener('click', function (e) {
        const deleteButton = e.target.closest('.btn--delete_from_list');
        const ingredientElement = deleteButton.closest(
          '.shopping-list__ingredient'
        );
        const ingredient = ingredientElement.querySelector(
          '.recipe__description'
        ).textContent;
        handler(ingredient);
      });
    }
  }

  addHandlerPrint(handler) {
    console.log('yesy');
    const printButton = document.querySelector('.btn.print__btn');
    if (!printButton) return;
    printButton.addEventListener('click', () => {
      handler();
    });
  }

  addIngredient(ingredient, shoppingListData) {
    console.log(typeof shoppingListData);
    if (shoppingListData === 'undefined') {
      shoppingListData = [];
    }

    console.log(`ingredient: ${ingredient}`);

    const trimmedIngredient = ingredient.trim();

    let shoppingListDataCopy = new Set(shoppingListData);

    if (shoppingListDataCopy.has(trimmedIngredient)) {
      const stringArray = [].concat(...shoppingListDataCopy);
      console.log(stringArray);
      return stringArray;
    }

    shoppingListDataCopy.add(ingredient);
    console.log(shoppingListDataCopy);

    const html = `
      <li class="shopping-list__ingredient" style="position: relative; left: 35px; top: 10px;" data-ingredient="${ingredient.trim()}">
        <h1 class="recipe__description">${ingredient}</h1>
        <button class="btn--tiny btn--delete_from_list" style="position: relative; left: 316px; bottom: 19px;">
          <svg>
            <use href="${icons}#icon-minus-circle"></use>
          </svg>
        </button>
      </li>
    `;

    this._parentElement.insertAdjacentHTML('beforeend', html);

    const stringArray = [].concat(...shoppingListDataCopy);
    console.log(stringArray);
    return stringArray;
  }

  deleteIngredient(ingredient, shoppingListData) {
    const ingredientElements = this._parentElement.querySelectorAll(
      '.shopping-list__ingredient'
    );

    ingredientElements.forEach(element => {
      const descriptionElement = element.querySelector('.recipe__description');
      const ingredientText = descriptionElement.textContent.trim();

      if (ingredientText === ingredient.trim()) {
        element.remove();
      }
    });
  }

  _generateMarkup() {
    const dataString = localStorage.getItem('shoppingList');

    const data = JSON.parse(dataString);
    return (
      `<button class="btn print__btn" style="position: relative; left: 120px;">Print</button> <div class="shopping-list__ingredients-only">` +
      data
        .map(ingredient => this._generateShoppingListMarkup(ingredient))
        .join('') +
      `</div>`
    );
  }

  // _generateMarkup() {
  //   const data = localStorage.shoppingList;

  //   return (
  //     `<button class="btn print__btn" style="position: relative; left: 120px;">Print</button>` +
  //     data
  //       .map(ingredient => this._generateShoppingListMarkup(ingredient))
  //       .join('')
  //   );
  // }

  _generateShoppingListMarkup(ingredient) {
    return `
      <li class="shopping-list__ingredient">
          <h1 class="recipe__description" style="position: relative; left: 35px; top: 10px;">
              ${ingredient}
          </h1>
          <button class="btn--tiny btn--delete_from_list" style="position: relative; left: 350px; bottom: 10px;">
              <svg>
                  <use href="${icons}#icon-minus-circle"></use>
              </svg>
          </button>
      </li>
    `;
  }
}

export default new ShoppingCartView();
