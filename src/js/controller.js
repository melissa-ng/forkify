import * as model from './model.js';
import { MODAL_CLOSE_SEC, API_URL, KEY } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import shoppingCartView from './views/shoppingCartView.js';

import { AJAX } from './helpers.js';
// import shoppingListView from './views/shoppingListView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    console.log('clicking');
    // Show loading spinner
    addRecipeView.renderSpinner();

    if (addRecipeView.isEditing) {
      model.deleteBookmark(model.state.recipe.id);

      const id = model.state.recipe.id;
      const deleteRecipe = await AJAX(
        `${API_URL}${id}?key=${KEY}`,
        null,
        'DELETE'
      );
      addRecipeView.isEditing = false;
    }

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    // setTimeout(function () {
    //   addRecipeView.toggleWindow();
    // }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const controlEditRecipe = async function () {
  addRecipeView.toggleWindow();
  addRecipeView.isEditing = true;

  console.log(model.state.recipe);

  // Get the input values from the recipe data section
  const title = model.state.recipe.title;
  const sourceUrl = model.state.recipe.sourceUrl;
  const image = model.state.recipe.image;
  const publisher = model.state.recipe.publisher;
  const cookingTime = model.state.recipe.cookingTime;
  const servings = model.state.recipe.servings;

  const editedRecipe = {
    ...model.state.recipe, // Copy the existing recipe object
    title: title !== '' ? title : model.state.recipe.title,
    sourceUrl: sourceUrl !== '' ? sourceUrl : model.state.recipe.sourceUrl,
    image: image !== '' ? image : model.state.recipe.image,
    publisher: publisher !== '' ? publisher : model.state.recipe.publisher,
    cookingTime:
      cookingTime !== '' ? +cookingTime : model.state.recipe.cookingTime,
    servings: servings !== '' ? +servings : model.state.recipe.servings,
  };

  clearIngredientsForm();

  addRecipeView.ingredientsCounter = 1;

  // Loop through the ingredients array and fill the form
  editedRecipe.ingredients.forEach(ingredient => {
    const { quantity, unit, description } = ingredient;
    addRecipeView.addIngredient(quantity, unit, description);
  });

  clearDataForm(title, sourceUrl, image, publisher, cookingTime, servings);
};

const clearDataForm = function (
  title,
  sourceUrl,
  image,
  publisher,
  cookingTime,
  servings
) {
  addRecipeView._data.innerHTML = `<h3 class="upload__heading">Recipe data</h3>
    <label>Title</label>
    <input value="${title}" required name="title" type="text" />
    <label>URL</label>
    <input value="${sourceUrl}" required name="sourceUrl" type="text" />
    <label>Image URL</label>
    <input value="${image}" required name="image" type="text" />
    <label>Publisher</label>
    <input value="${publisher}" required name="publisher" type="text" />
    <label>Prep time</label>
    <input value="${cookingTime}" required name="cookingTime" type="number" />
    <label>Servings</label>
    <input value="${servings}" required name="servings" type="number" />`;
};

const clearIngredientsForm = function () {
  addRecipeView._column.innerHTML =
    '<h3 class="upload__heading">Ingredients</h3>'; // Clear all HTML content inside the _column element
  addRecipeView.ingredients = 1; // Reset the ingredients count to 1
};

const controlShoppingCart = function () {
  shoppingCartView.render(localStorage.shoppingList);
  shoppingCartView.addHandlerPrint(controlPrintShoppingList);
  shoppingCartView.addHandlerDeleteFromList(controlDeleteShoppingList);
};

const controlPrintShoppingList = function () {
  console.log(typeof model.state.shoppingList);
  console.log(model.state.shoppingList);
  const shoppingList = model.state.shoppingList;
  const ingredientsList = shoppingList.join('\n');

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <style>
          h1 {
            font-size: 24px;
          }
        </style>
      </head>
      <body>
        <h1>Shopping List</h1>
        <pre>${ingredientsList}</pre>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

const clearShoppingList = function () {
  localStorage.clear('shoppingList');
};

const persistShoppingList = function () {
  localStorage.setItem(
    'shoppingList',
    JSON.stringify(model.state.shoppingList)
  );
  console.log(localStorage.shoppingList);
};

const controlDeleteShoppingList = function (ingredient) {
  console.log(model.state.shoppingList);
  const shoppingListData = model.state.shoppingList;
  shoppingCartView.deleteIngredient(ingredient, shoppingListData);

  let ingredientIndex = -1;
  for (let i = 0; i < model.state.shoppingList.length; i++) {
    if (model.state.shoppingList[i].trim() === ingredient.trim()) {
      ingredientIndex = i;
      break;
    }
  }
  if (ingredientIndex !== -1) {
    console.log(typeof model.state.shoppingList);
    model.state.shoppingList.splice(ingredientIndex, 1);
    persistShoppingList(); // Save updated shopping list to localStorage
  }

  localStorage.shoppingList = model.state.shoppingList;

  console.log(model.state.shoppingList);
};

const controlAddIngredient = function (ingredient) {
  const shoppingListData = model.state.shoppingList;
  console.log(model.state.shoppingList);
  model.state.shoppingList = shoppingCartView.addIngredient(
    ingredient,
    shoppingListData
  );

  persistShoppingList();
  shoppingCartView.render(model.state.shoppingList);
  location.reload();
};

const retrieveShoppingList = function () {
  const storedShoppingList = localStorage.getItem('shoppingList');
  if (storedShoppingList) {
    const parsedShoppingList = JSON.parse(storedShoppingList);
    model.state.shoppingList = parsedShoppingList;
  }
  console.log('retrieveShoppingList executed');
};

const init = function () {
  console.log(localStorage.shoppingList);
  console.log(typeof localStorage.shoppingList);

  // const shoppingList = JSON.parse(localStorage.shoppingList);
  // console.log(shoppingList);
  // if (localStorage.shoppingList === undefined) {
  //   localStorage.shoppingList = [];
  // }
  // // if (Object.keys(shoppingList).length !== 0) {
  // //   localStorage.shoppingList = [];
  // // }
  // model.state.shoppingList = localStorage.shoppingList;
  // }
  // model.state.shoppingList = JSON.parse(localStorage.shoppingList);
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerEdit(controlEditRecipe);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  shoppingCartView.addHandlerRender(controlShoppingCart);
  recipeView.addHandlerAddIngredient(controlAddIngredient);
  retrieveShoppingList();
  console.log(localStorage.shoppingList);
  console.log(model.state.shoppingList);
};
init();
