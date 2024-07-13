import * as model from './model.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js';
import resultView from './views/resultView.js'; 
import bookmarkView from './views/bookmarkView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODEL_CLOSE_SEC } from './config.js';


import 'core-js/stable';
import 'regenerator-runtime/runtime'





if(module.hot){
  module.hot.accept()
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////


const controlRecipes = async function(){
  try{
    const id = window.location.hash.slice(1);
    if(!id) return
    
    // 0) Update  results view to mark selected search result
    resultView.update(model.getSearchResultPage())
    bookmarkView.update(model.state.bookmarks)
    // 1) Loading recipe
    await model.loadRecipe(id)
    // 2) Rendering recipe 
    recipeView.render(model.state.recipe)
    controlServings()

  }
  catch(err){
    recipeView.renderError();
    console.error(err)
  }


}

const controlSearchResult = async function(){
  try{
    resultView.renderSpiner()

    console.log(resultView)
    // Get search query
    const query = searchView.getQuery();
    
    if(!query) return;
    // Load search results
    await model.loadSearchResult(query)
    console.log(model.state.search.result)
    // Render Result
    // resultView.render(model.state.search.result)
    resultView.render(model.getSearchResultPage())

    // Render initial pagination
    paginationView.render(model.state.search)


  }catch(err){console.error(err)}
}


const controlPagination = function(goToPage){
    // Render New Result
    resultView.render(model.getSearchResultPage(goToPage))

    // Render initial NEW pagination
    paginationView.render(model.state.search)
}

const controlServings = function(newServings = 4){
  // Update the recipe servings (in state)
  model.updateServings(newServings)

  // Update the recipe view
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)

}


const controlAddBookMark = function(){
  // 1) Add or remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookMark(model.state.recipe);
  } else {
    model.deleteBookMark(model.state.recipe.id);
  }
  // 2) Update bookmark
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarkView.render(model.state.bookmarks)
}

// const controlAddBookmark = function () {
//   if (!model.state.recipe.boomarked) model.addBookmarks(model.state.recipe);
//     else model.deleteBookmark(model.state.recipe.id)
 
  
//   console.log(model.state.recipe);
//   recipeView.update(model.state.recipe);
// };

const controlBookMarks = function(){
  bookmarkView.render(model.state.bookmarks)
}

const contolAddRecipe = async function(newRecipe){
  try{  
    // spinner loading
    addRecipeView.renderSpiner()

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe)

    // Render Recipe
    recipeView.render(model.state.recipe);

    // Success message 
    addRecipeView.renderMessage()

    // Render book
    bookmarkView.render(model.state.bookmarks)

    // Change id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)
    

    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow()

      console.log('piska')
      }, MODEL_CLOSE_SEC * 1000);
  }catch(err){
    console.log(err)
    console.error("🧶", err)
    addRecipeView.renderError(err.message || "An unexpected error occurred.");
    
  }
}
const init = function (){
  recipeView.addHandlerRender(controlRecipes)
  bookmarkView.addHandlerRender(controlBookMarks)
  recipeView.addHanlderUpdateServings(controlServings)
  recipeView.addHanlderaddBookMark(controlAddBookMark)
  searchView.addHandlerSearch(controlSearchResult)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(contolAddRecipe)
}
init()


