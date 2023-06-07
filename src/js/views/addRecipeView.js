import icons from 'url:../../img/icons.svg';
import View from './View.js';
import { API_URL, RES_PER_PAGE, KEY } from '../config.js';

class AddRecipeView extends View {
  isEditing = false;
  ingredientsCounter = 1;
  existingIngredient = false;
  _parentElement = document.querySelector('.upload');

  _message = 'Recipe was successfully uploaded :)';

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');
  _btnAdd = document.querySelector('.add__btn');
  _column = document.querySelector('.upload__column');
  _data = document.querySelector('.upload__data');

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
    this.addHandlerIngredient();
    this.addHandlerDelete();
  }

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', () => {
      this.toggleWindow();
      this.clearIngredients();
      if (!this.existingIngredient) {
        this.ingredientsCounter = 1;
        this.addIngredient();
        this.ingredientsCounter = 2;
        this.existingIngredient = true;
      }
    });
  }

  clearIngredients() {
    const ingredientInputs = document.querySelectorAll(
      '.upload__column input[name^="ingredient-"]'
    );
    ingredientInputs.forEach(input => {
      input.value = '';
      this.existingIngredient = true;
    });
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  addHandlerIngredient() {
    this._btnAdd.addEventListener('click', e => {
      e.preventDefault();
      this.addIngredient();
    });
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();

      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);

      // Check for invalid quantity values
      const invalidIngredients = [];
      for (const key in data) {
        if (key.startsWith('ingredient') && key.endsWith('-Quantity')) {
          const quantity = data[key];
          if (isNaN(quantity)) {
            const ingredientNumber = key.split('-')[1];
            invalidIngredients.push(ingredientNumber);
          }
        }
      }

      if (invalidIngredients.length > 0) {
        const message = `Invalid quantity values for Ingredient(s): ${invalidIngredients.join(
          ', '
        )}. Please enter a valid number.`;
        alert(message);
      } else {
        handler(data);
      }
    });
  }

  addIngredient(quantity = '', unit = '', description = '') {
    const html = `
    <div>
    <label>Ingredient ${this.ingredientsCounter}</label>
    
    <input
    value="${quantity}"
      type="text"
      name="ingredient-${this.ingredientsCounter}-Quantity"
      placeholder="Quantity"
    />
    <input     value="${unit}"
     type="text" name="ingredient-${
       this.ingredientsCounter
     }-Unit" placeholder="Unit" />
    <input
    value="${description}"
      type="text"
      required
      name="ingredient-${this.ingredientsCounter}-Description"
      placeholder="Description"
    />
    <button type="button" class="btn--tiny btn--delete_ingredient ${
      this.ingredientsCounter !== 1 ? '' : 'hidden'
    }" style="position: relative; bottom: 30px;">
      <svg>
        <use href="${icons}#icon-minus-circle"></use>
      </svg>
    </button>
    </div>`;

    this._column.insertAdjacentHTML('beforeend', html);

    const ingredientElements = this._column.querySelectorAll(
      '.upload__column > div'
    );
    ingredientElements.forEach((ingredient, index) => {
      const label = ingredient.querySelector('label');
      label.textContent = `Ingredient ${index + 1}`;
    });

    ++this.ingredientsCounter;
    this.addHandlerDelete();
  }

  addHandlerDelete() {
    const deleteButtons = this._column.querySelectorAll(
      '.btn--delete_ingredient'
    );
    deleteButtons.forEach(btnDelete => {
      btnDelete.addEventListener('click', e => {
        e.preventDefault();
        const ingredientElement = e.target.closest(
          '.btn--delete_ingredient'
        ).parentElement;
        ingredientElement.remove();

        const ingredientElements = this._column.querySelectorAll(
          '.upload__column > div'
        );
        ingredientElements.forEach((ingredient, index) => {
          const label = ingredient.querySelector('label');
          label.textContent = `Ingredient ${index + 1}`;
        });

        --this.ingredientsCounter;
      });
    });
  }

  _generateMarkup() {}
}

export default new AddRecipeView();
