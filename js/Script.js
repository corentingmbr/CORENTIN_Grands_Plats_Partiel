document.addEventListener('DOMContentLoaded', () => {
    const mainSearchInput = document.getElementById('search');
    const IngredientSearchInput = document.getElementById('search-ingredient');
    const recipesListContainer = document.getElementById('recipes-list');
    const ingredientsList = document.getElementById('ingredients-list');
    const tagsContainer = document.getElementById('tags-container');
    let allRecipes = [];
    let allIngredients = getIngredients(allRecipes);    let filteredRecipes = [];
    let ingredientSearch = [];
    const tags = [];

    // récupère le json
    async function fetchRecipes() {
        try {
            const response = await fetch('./assets/json/recipes.json');
            allRecipes = await response.json();
            displayRecipes(allRecipes);
            updateIngredientList(allRecipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipesListContainer.innerHTML = '<p>Erreur de chargement des recettes.</p>';
        }
    }

    // Affichage de la recette
    function createRecipeCard(recipe) {
        return `
        <div class="col" id="${recipe.id}">
            <div class="card h-100">
                <div class="card-img-top"></div>
                <div class="card-body">
                    <div class="row mb-2">
                        <h2 class="card-title col-8 card-name">${recipe.name}</h2>
                        <div class="card-title col-4 text-end card-time-container">
                            <img class="me-1 card-time-watch" alt="" src="./assets/img/watch-time.svg" />
                            <span class="card-time">${recipe.time} min</span>
                        </div>
                    </div>
                    <div class="row">
                        <ul class="card-text col-6 list-unstyled card-ingredients-list">
                            ${recipe.ingredients.map(ingredient => `
                                <li class="card-ingredients-list-item">
                                    <span class="card-ingredients-list-item-ingredient">${ingredient.ingredient}</span>
                                    <span class="card-ingredients-list-item-quantity">${ingredient.quantity || ''}</span>
                                    <span class="card-ingredients-list-item-unit">${ingredient.unit || ''}</span>
                                </li>
                            `).join('')}
                        </ul>
                        <p class="card-text col-6 card-description">${recipe.description}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    // affiches les recettes (ou pas si pas de recetes correspondante)
    function displayRecipes(recipes) {
        if (recipes.length === 0) {
            recipesListContainer.innerHTML = '<p class="col-12 text-center">Aucune recette ne correspond à votre recherche...<br>Vous pouvez chercher "tarte aux pommes","poisson",etc.</p>';
            return;
        }

        recipesListContainer.innerHTML = recipes.map(createRecipeCard).join('');
    }

    // trouve les ingrédients dans les recettes
    function getIngredients(recipes) {
        const ingredients = new Set();
        recipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => {
                ingredients.add(ing.ingredient);
            });
        });
        return Array.from(ingredients);
    }

    // affiche les ingrédients
    function displayIngredients(ingredients) {
        ingredientsList.innerHTML = '';
        ingredients.forEach(ingredient => {
            const ingredientItem = document.createElement('li');
            ingredientItem.className = 'tags-ingredients';
            ingredientItem.innerHTML = `<button class="dropdown-item btn-tag-ingredient" type="button" value="${ingredient}">${ingredient}</button>`;
            ingredientItem.querySelector('button').addEventListener('click', () => addTag(ingredient));
            ingredientsList.appendChild(ingredientItem);
        });
    }

    // met à jour la list d'ingrédients
    function updateIngredientList(recipes) {
        const ingredients = getIngredients(recipes);
        displayIngredients(ingredients);
    }

    // rajoute un tag
    function addTag(ingredient) {
        if (!tags.includes(ingredient)) {
            tags.push(ingredient);
            displayTags();
            filterRecipes();
        }
    }

    // affiche les tags si select
    function displayTags() {
        tagsContainer.innerHTML = '';
        tags.forEach(tag => {
            const tagItem = document.createElement('div');
            tagItem.className = `tags badge tag-${tag.replace(/\s+/g, '-').toLowerCase()} bg-primary ps-3 pe-2 py-2 me-3 mb-2 rounded`;
            tagItem.innerHTML = `
                <span>${tag}</span>
                <button type="button" class="tag-close-btn align-middle ms-1" aria-label="Close">
                    <img src="./assets/img/tag-close.svg" alt="" aria-hidden="true" />
                </button>
            `;
            tagItem.querySelector('button').addEventListener('click', () => removeTag(tag));
            tagsContainer.appendChild(tagItem);
        });
    }

    // retire le tag
    function removeTag(tag) {
        const index = tags.indexOf(tag);
        if (index > -1) {
            tags.splice(index, 1);
            displayTags();
            filterRecipes();
        }
    }

    // filtre des recetes par tag
    function filterRecipes() {
        filteredRecipes = allRecipes.filter(recipe => {
            return tags.every(tag => recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === tag.toLowerCase()));
        });
        displayRecipes(filteredRecipes);
        updateIngredientList(filteredRecipes);
    }

    // Recherche dans la grande barre
    function performMainSearch() {
        const searchTerm = mainSearchInput.value.toLowerCase().trim();

        if (searchTerm.length < 3) {
            displayRecipes(allRecipes);
            updateIngredientList(allRecipes);
            return;
        }
        filteredRecipes = allRecipes.filter(recipe =>
            recipe.name.toLowerCase().includes(searchTerm) ||
            recipe.description.toLowerCase().includes(searchTerm)
        );
        displayRecipes(filteredRecipes);
        updateIngredientList(filteredRecipes);
    }

    function performIngredientSearch() {
        const searchTerm = IngredientSearchInput.value.toLowerCase().trim();

        if (searchTerm.length < 3) {
            displayIngredients(allIngredients);
            return;
        }
        const filteredIngredients = allIngredients.filter(ingredient => ingredient.toLowerCase().includes(searchTerm));
        displayIngredients(filteredIngredients);
    }
    function initSearch() {
        fetchRecipes();

        mainSearchInput.addEventListener('input', performMainSearch);
        IngredientSearchInput.addEventListener('input', performIngredientSearch);
    }
    initSearch();
});