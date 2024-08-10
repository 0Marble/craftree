const recipe_table = document.getElementById("recipe_table")
const recipe_form = document.getElementById("new_recipe_form")
const recipe_inputs_div = document.getElementById("recipe_inputs")
const add_input_button = document.getElementById("add_input_button")
const add_recipe_button = document.getElementById("add_recipe_button")
const reset_recipe_button = document.getElementById("reset_recipe_button")
const target_item = document.getElementById("target_item")
const target_amount = document.getElementById("target_amount")
const machine = document.getElementById("recipe_machine")
const machine_div = document.getElementById("machine_div")
const import_button = document.getElementById("import_recipes_button")
const export_button = document.getElementById("export_recipes_button")

import { RecipeStore, Recipe } from "../recipe.js"
import { Suggestions  } from "./suggestions.js"
import { saveAsTextFile, readFromTextFile } from "./files.js"
import { itemWithAmount } from "./components.js"

export let recipe_store = new RecipeStore()

new Suggestions(machine_div, machine, () => recipe_store.getMachines())

export_button.addEventListener("click", () => {
    let s = recipe_store.toString()
    saveAsTextFile("recipes.json", s)
})
import_button.addEventListener("click", () => {
    readFromTextFile(import_button.files[0], (s) => {
        recipe_store = RecipeStore.fromString(s);
        recipe_table.replaceChildren()
        for (let r of recipe_store.getAllRecipes()) {
            addRecipeToTable(r)
        }
    })
})

const input_item_class = "recipe_input_item"
const input_amount_class = "recipe_input_amount"
const input_class = "recipe_input_div"
recipe_inputs_div.replaceChildren(addRecipeInputForm())

add_input_button.addEventListener("click", () => {
    recipe_inputs_div.append(addRecipeInputForm())
})
add_recipe_button.addEventListener("click", () => {
    let r = readRecipe()
    console.log(r)
    recipe_store.addRecipe(r)
    clearRecipeForm()
    addRecipeToTable(r)
})
reset_recipe_button.addEventListener("click", () => {
    clearRecipeForm()
})

function addRecipeInputForm(item, amount) {
    return itemWithAmount(
        input_class, 
        input_item_class, 
        input_amount_class, 
        () => recipe_store.getItems(), 
        item, 
        amount
    )
}

function clearRecipeForm(recipe) {
    target_item.value = ""
    target_amount.value = 1
    machine.value = ""

    recipe_inputs_div.replaceChildren()
    if (recipe === undefined) {
        recipe_inputs_div.append(addRecipeInputForm())
    } else {
        target_item.value = recipe.output.item
        target_amount.value = recipe.output.amount
        machine.value = recipe.machine
        for (let {item, amount} of recipe.inputs) {
            recipe_inputs_div.append(addRecipeInputForm(item, amount))
        }
    }
}

function readRecipe() {
    let target = {item: target_item.value, amount: parseInt(target_amount.value)}

    let input_items = document.getElementsByClassName(input_item_class)
    let input_amounts = document.getElementsByClassName(input_amount_class)
    console.assert(input_items.length === input_amounts.length)

    let inputs_map = new Map()
    for (let i = 0; i < input_items.length; i++) {
        let item = input_items[i].value
        let amount = parseInt(input_amounts[i].value)
        if (!inputs_map.has(item)) inputs_map.set(item, amount)
        else inputs_map.set(item, amount + inputs_map.get(item))
    }
    let inputs = []
    for (let [item, amount] of inputs_map) {
        inputs.push({item, amount})
    }

    return new Recipe(inputs, target, machine.value)
}


function addRecipeToTable(recipe) {
    let new_row = document.createElement("tr")
    let output = document.createElement("th")
    output.scope = "row"
    output.append(`${recipe.output.item} x${recipe.output.amount}`)

    let inputs = document.createElement("td")
    for (let {item, amount} of recipe.inputs) {
        inputs.append(`${item} x${amount}, `)
    }

    let machine = document.createElement("td")
    machine.append(recipe.machine)

    let rm = document.createElement("button")
    rm.addEventListener("click", (e) => {
        new_row.remove()
        recipe_store.removeRecipe(recipe)
    })
    rm.append("Del")

    let edit = document.createElement("button")
    edit.addEventListener("click", () => {
        new_row.remove()
        recipe_store.removeRecipe(recipe)
        clearRecipeForm(recipe)
    })
    edit.append("Edit")

    recipe_table.append(new_row)
    new_row.append(output, inputs, machine, rm, edit)
}
