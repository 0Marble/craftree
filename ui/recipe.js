const recipe_table = document.getElementById("recipe_table")
const recipe_form = document.getElementById("new_recipe_form")
const recipe_inputs_div = document.getElementById("recipe_inputs")
const add_input_button = document.getElementById("add_input_button")
const recipe_outputs_div = document.getElementById("recipe_outputs")
const add_output_button = document.getElementById("add_output_button")
const add_recipe_button = document.getElementById("add_recipe_button")
const reset_recipe_button = document.getElementById("reset_recipe_button")
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
import_button.addEventListener("change", () => {
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
const output_item_class = "recipe_output_item"
const output_amount_class = "recipe_output_amount"
const output_class = "recipe_output_div"

clearRecipeForm()

add_input_button.addEventListener("click", () => {
    recipe_inputs_div.append(addRecipeInputForm())
})
add_output_button.addEventListener("click", () => {
    recipe_outputs_div.append(addRecipeOutputForm())
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
    return itemWithAmount({
        div_class: input_class, 
        input_item_class: input_item_class, 
        input_amount_class: input_amount_class, 
        getSuggestions: () => recipe_store.getItems(), 
        item, 
        amount
    })
}
function addRecipeOutputForm(item, amount) {
    return itemWithAmount({
        div_class: output_class, 
        input_item_class: output_item_class, 
        input_amount_class: output_amount_class, 
        getSuggestions: () => recipe_store.getItems(), 
        item, 
        amount
    })
}

function clearRecipeForm(recipe) {
    machine.value = ""

    recipe_inputs_div.replaceChildren()
    recipe_outputs_div.replaceChildren()
    if (recipe === undefined) {
        recipe_inputs_div.append(addRecipeInputForm())
        recipe_outputs_div.append(addRecipeOutputForm())
    } else {
        machine.value = recipe.machine
        for (let {item, amount} of recipe.inputs) {
            recipe_inputs_div.append(addRecipeInputForm(item, amount))
        }
        for (let {item, amount} of recipe.outputs) {
            recipe_outputs_div.append(addRecipeOutputForm(item, amount))
        }
    }
}

function readRecipe() {
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

    let output_items = document.getElementsByClassName(output_item_class)
    let output_amounts = document.getElementsByClassName(output_amount_class)
    console.assert(output_items.length === output_amounts.length)
    let outputs_map = new Map()
    for (let i = 0; i < output_items.length; i++) {
        let item = output_items[i].value
        let amount = parseInt(output_amounts[i].value)
        if (!outputs_map.has(item)) outputs_map.set(item, amount)
        else outputs_map.set(item, amount + outputs_map.get(item))
    }
    let outputs = []
    for (let [item, amount] of outputs_map) {
        outputs.push({item, amount})
    }

    return new Recipe(inputs, outputs, machine.value)
}

function addRecipeToTable(recipe) {
    let new_row = document.createElement("tr")
    let output = document.createElement("th")
    output.scope = "row"

    for (let {item, amount} of recipe.outputs) {
        output.append(`${item} x${amount}, `)
    }

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
