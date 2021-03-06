var logJSON;

$(document).ready(function() {
    searchSelect();
    getLogJSON();

    document.getElementById('add-item').addEventListener('click', () => {
        if (validateAdd()) {
            addItem('search');
            calculateNumberOfMeals();
            calculateMealNutritions();
            clearListAdd();
        }
    })

    document.getElementById('clear-item').addEventListener('click', clearListAdd);
    deleteItem();
    itemModal();
});

/**
 * Handles when a search result is clicked on
 */
function searchSelect() {
    $('.results').on('click', 'li', function() {
        var type, nix_item_id, name, imageURL, servingUnit, calories
        var searchInput = document.getElementById('search-input');
        var searchList = document.getElementById('search-list');
        type = $(this).parent().attr('id').split('-')[0];
        type === 'branded' ? nix_item_id = $(this).find(".nix_item_id").text() : nix_item_id = '';
        name = $(this).find(".name").text();
        imageURL = $(this).find('img').attr('src');
        servingUnit = $(this).find("[data-info=serving-unit]").text();
        calories = $(this).find("[data-info=calories]").text();

        searchInput.value = name;
        searchList.style.display = 'none';
        document.getElementById('add-to-display').style.display = 'none'
        document.getElementById('list-add').style.display = ''

        $('#add-to-display').hide();
        $('.list-add').show();
        updateAddList(type, nix_item_id, name, imageURL, servingUnit, calories);
    });
}

/**
 * Updates the item-add section
 * @param {string} name name of the item
 * @param {string} imageURL url of the item's image
 * @param {string} servingUnit serving unit of the item
 * @param {number} calories number of calories for 1 serving of the item
 */
function updateAddList(type, nix_item_id, name, imageURL, servingUnit, calories) {
    document.getElementById('type').textContent = type;
    document.getElementById('nix_item_id').textContent = nix_item_id;
    document.getElementById('name').textContent = name;
    document.getElementById('image').setAttribute('src', imageURL);
    var servings = document.getElementById('servings')
    servings.value = 1;
    var caloriesAmount = document.getElementById('calories-amount')
    caloriesAmount.textContent = calories;
    document.getElementById('serving-unit').textContent = servingUnit;
    document.getElementById('meal-select').value = '';

    var caloriesPerServingQty = parseInt(caloriesAmount.textContent)

    servings.addEventListener('keyup', () => {
        caloriesAmount.textContent = caloriesPerServingQty * servings.value;
    })
}

function addItemToList(item) {
    const itemTemplate = `
        <li class="item">
            <button class="custom-button red delete-item"><i class="fas fa-times"></i></button>
            <img src="${item.imageURL}">
            <div class="info">
                <h2 class="name" title="${item.name}">${item.name}</h2>
                <span class="servings">Servings: ${item.servingQty}
                    <span>${item.servingUnit}</span>
                </span>
            </div>
            <div class="nutritions">
                <button><span class="nutrition calories"><strong>${item.nutritions.calories}</strong> calories</span></button>
                <button><span class="nutrition total_fat"><strong>${item.nutritions.total_fat}</strong> g total fat</span></button>
                <button><span class="nutrition cholesterol"><strong>${item.nutritions.cholesterol}</strong> mg cholesterol</span></button>
            </div>
            <i class="fas fa-chevron-right expand-item" href="#${item.meal}-${item.name.replace(/\s+/g, '-').toLowerCase()}"></i>
            <div class="modal" id="${item.meal}-${item.name.replace(/\s+/g, '-').toLowerCase()}">
                 <div class="modal-content">
                     <div class="close-modal">
                         <i class="fas fa-times"></i>
                     </div>
                     <div class="nutrition-label"></div>
                 </div>
             </div>
        </li>
    `;
    document.querySelector('#' + item.meal + ' .items').innerHTML += itemTemplate;
    calculateNumberOfMeals();
    calculateMealNutritions();
}

function addItem(method) {
    var item = {
        type: '',
        name: '',
        meal: '',
        imageURL: '',
        servingQty: 1,
        servingUnit: '',
        nutritions: {
            calories: 1,
            total_fat: 1,
            saturated_fat: 1,
            cholesterol: 1,
            sodium: 1,
            total_carbohydrate: 1,
            dietary_fiber: 1,
            sugars: 1,
            protein: 1,
            potassium: 1
        },
    }

    // todo: fetch from nutritionix api for the item's nutritions
    if (method === 'search') {
        item.type = document.getElementById('type').textContent;
        item.name = document.getElementById('name').textContent;
        item.meal = document.getElementById('meal-select').value.toLowerCase();
        item.imageURL = document.getElementById('image').getAttribute('src');
        item.servingQty = document.getElementById('servings').value;
        item.servingUnit = document.getElementById('serving-unit').textContent;
        item.nutritions.calories = document.getElementById('calories-amount').textContent;
        if (item.type === 'common') {
            $.ajax({
                url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
                type: "POST",
                dataType: "json",
                data: { 
                    query: item.name
                },
                success: (result) => {
                    var resultItem = result.foods[0];
                    item.nutritions.total_fat = resultItem.nf_total_fat;
                    item.nutritions.saturated_fat = resultItem.nf_saturated_fat;
                    item.nutritions.cholesterol = resultItem.nf_cholesterol;
                    item.nutritions.sodium = resultItem.nf_sodium;
                    item.nutritions.total_carbohydrate = resultItem.nf_total_carbohydrate;
                    item.nutritions.dietary_fiber = resultItem.nf_dietary_fiber;
                    item.nutritions.sugars = resultItem.nf_sugars;
                    item.nutritions.protein = resultItem.nf_protein;
                    item.nutritions.potassium = resultItem.nf_potassium;
                    addItemToList(item);
                    postItem(item);
                    nutritionLabel(item);
                }
            });
        } else if (item.type === 'branded') {
            var id = document.getElementById('nix_item_id').textContent;
            $.ajax({
                url: 'https://trackapi.nutritionix.com/v2/search/item?nix_item_id=' + id,
                type: "GET",
                success: (result) => {
                    var resultItem = result.foods[0];
                    item.nutritions.total_fat = resultItem.nf_total_fat;
                    item.nutritions.saturated_fat = resultItem.nf_saturated_fat;
                    item.nutritions.cholesterol = resultItem.nf_cholesterol;
                    item.nutritions.sodium = resultItem.nf_sodium;
                    item.nutritions.total_carbohydrate = resultItem.nf_total_carbohydrate;
                    item.nutritions.dietary_fiber = resultItem.nf_dietary_fiber;
                    item.nutritions.sugars = resultItem.nf_sugars;
                    item.nutritions.protein = resultItem.nf_protein;
                    item.nutritions.potassium = resultItem.nf_potassium;
                    addItemToList(item);
                    postItem(item);
                    nutritionLabel(item);
                }
            });
        }
    } else if (method === 'db') {
        for (let i in logJSON) {
            if (logJSON[i].date == getUrlDate()) {
                var items = logJSON[i].items
                for (let i in items) {
                    item.name = items[i].name;
                    item.meal = items[i].meal;
                    item.imageURL = items[i].image_url;
                    item.servingQty = items[i].serving_qty;
                    item.servingUnit = items[i].serving_unit;
                    item.nutritions.calories = items[i].nutritions.calories;
                    item.nutritions.total_fat = items[i].nutritions.total_fat;
                    item.nutritions.saturated_fat = items[i].nutritions.saturated_fat;
                    item.nutritions.cholesterol = items[i].nutritions.cholesterol;
                    item.nutritions.sodium = items[i].nutritions.sodium;
                    item.nutritions.total_carbohydrate = items[i].nutritions.total_carbohydrate;
                    item.nutritions.dietary_fiber = items[i].nutritions.dietary_fiber;
                    item.nutritions.sugars = items[i].nutritions.sugars;
                    item.nutritions.protein = items[i].nutritions.protein;
                    item.nutritions.potassium = items[i].nutritions.potassium;
                    addItemToList(item);
                    nutritionLabel(item);
                }
            }
        }
    }
}

function postItem(item) {
    $.ajax({
        url: '/db/log/' + getUrlDate() + '/add',
        type: "POST",
        dataType: "json",
        data: { 
            name: item.name,
            meal: item.meal,
            image_url: item.imageURL,
            serving_qty: item.servingQty,
            serving_unit: item.servingUnit,
            'nutritions.calories': item.nutritions.calories,
            'nutritions.total_fat': item.nutritions.total_fat,
            'nutritions.saturated_fat': item.nutritions.saturated_fat,
            'nutritions.cholesterol': item.nutritions.cholesterol,
            'nutritions.sodium': item.nutritions.sodium,
            'nutritions.total_carbohydrate': item.nutritions.total_carbohydrate,
            'nutritions.dietary_fiber': item.nutritions.dietary_fiber,
            'nutritions.sugars': item.nutritions.sugars,
            'nutritions.protein': item.nutritions.protein,
            'nutritions.potassium': item.nutritions.potassium,
        }
    });
}

function getLogJSON() {
    $.getJSON("/db/log", (data) => {
        logJSON = data;
        for (let i in logJSON) {
            $('#' + logJSON[i].date).addClass('has-log');
        }
        addItem('db');
    });
}

function deleteItem() {
    $('.list').on('click', '.delete-item', function() {
        if (confirm("Are you sure you want to remove this item?")) {
            $.ajax({
                url: '/db/log/' + getUrlDate() + '/remove',
                type: "POST",
                dataType: "json",
                data: { 
                    name: $(this).parent().find('.name').text(),
                    meal: $(this).closest('.meal-group').attr('id'),
                }
            });
            $(this).parent().remove();
            calculateNumberOfMeals();
            calculateMealNutritions();
        }
    });
}

function clearListAdd() {
    document.getElementById('list-add').style.display = 'none';
    document.getElementById('add-to-display').style.display = '';
    document.getElementById('search-input').value = '';
}

function calculateMealNutritions() {
    var dayCals = 0;
    var dayFat = 0;
    var dayChol = 0;
    $('.meal-group').each(function() {
        var mealCals = 0;
        var mealFat = 0;
        var mealChol = 0;
        var foods = $(this).find('.items').children();
        foods.each(function () {
            mealCals += parseFloat($(this).find('.calories strong').text());
            mealFat += parseFloat($(this).find('.total_fat strong').text());
            mealChol += parseFloat($(this).find('.cholesterol strong').text());
        });
        $(this).find('.meal-nutritions').find('.calories strong').text(mealCals)
        $(this).find('.meal-nutritions').find('.total_fat strong').text(mealFat);
        $(this).find('.meal-nutritions').find('.cholesterol strong').text(mealChol);
        dayCals += mealCals;
        dayFat += mealFat;
        dayChol += mealChol;
    });
    $('.meals-total').find('.calories strong').text(dayCals)
    $('.meals-total').find('.total_fat strong').text(dayFat);
    $('.meals-total').find('.cholesterol strong').text(dayChol);
}

function calculateNumberOfMeals() {
    var total = 0;
    $('.meal-group').each(function() {
        var amount = $(this).find('.items').children().length;
        total += amount;
        $(this).find('.total').text('(' + amount + ')');
    });
    $('.meals-total .total').text('(' + total + ')');
}

function validateAdd() {
    var meal = document.getElementById('meal-select').value.toLowerCase();
    var name = document.getElementById('name').textContent;
    var servingQty = document.getElementById('servings');
    var canAdd = true;
    var name = name.toLowerCase();
    if (servingQty <= 0 || meal === '') canAdd = false;
    if (meal !== '') {
        var items = document.getElementById(meal).getElementsByClassName('item');
        for (var i = 0; i < items.length; i++) {
            var itemName = items[i].getElementsByClassName('name')[0].textContent.toLowerCase();
            if (name === itemName) canAdd = false
        }
    }
    return canAdd;
}

function itemModal() {
    var modalID;
    $('.list').on('click', '.expand-item', function() {
        modalID = $(this).attr('href');
        $(modalID).css('display', 'block');
    });
    $('.list').on('click', '.close-modal', function() {
        $(modalID).css('display', 'none');
    });
    $(document).mouseup((e) => {
        if (!$('.modal-content').is(e.target) && $('.modal-content').has(e.target).length === 0) {
            $('.modal').css('display', 'none');
        }
    });
}

function nutritionLabel(item) {
    var modalID = `#${item.meal}-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
    $(modalID + ' .nutrition-label').nutritionLabel({
        showServingUnitQuantityTextbox : false,
        showIngredients : false,
        showServingsPerContainer : false,
        showItemName : false,

        showPolyFat : false,
        showMonoFat : false,
        showTransFat : false,
        showFibers : false,
        showVitaminD : false,
        showPotassium_2018 : false,
        showCalcium : false,
        showIron : false,

        valueServingUnitQuantity : item.servingQty,
        valueServingSizeUnit : item.servingUnit,

        valueCalories : item.nutritions.calories,
        valueTotalFat : item.nutritions.total_fat,
        valueSatFat : item.nutritions.saturated_fat,
        valueCholesterol : item.nutritions.cholesterol,
        valueSodium : item.nutritions.sodium,
        valueTotalCarb : item.nutritions.nf_total_carbohydrate,
        valueSugars : item.nutritions.sugars,
        valueProteins : item.nutritions.protein,
        valuePotassium_2018 : item.nutritions.potassium,
        showLegacyVersion : false
    });
}