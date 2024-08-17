
const craft_targets = document.getElementById("targets_list")
const storage_div = document.getElementById("storage")
const add_storage_div = document.getElementById("add_to_storage")
const add_to_storage_button = document.getElementById("add_to_storage_button")
const steps_div = document.getElementById("steps")
const craft_button = document.getElementById("evaluate_craft")
const add_target_button = document.getElementById("add_target")

import { Planner } from "../plan.js"
import { Node } from "../graph.js"
import { recipe_store } from "./recipe.js"
import { itemWithAmount } from "./components.js"

const target_item_class = "target_item_class"
const target_amount_class = "target_amount_class"
const target_div_class = "target_div_class"

const storage_div_class = "storage_div_class"
const storage_item_class = "storage_item_class"
const storage_amount_class = "storage_amount_class"

let planner = new Planner()
craft_button.addEventListener("click", () => evaluateCraft())
add_target_button.addEventListener("click", () => {
    craft_targets.append(
        itemWithAmount({
            div_class: target_div_class,
            input_item_class: target_item_class,
            input_amount_class: target_amount_class,
            getSuggestions: () => recipe_store.getItems(),
        })
    )
})
craft_targets.append(
    itemWithAmount({
        div_class: target_div_class,
        input_item_class: target_item_class,
        input_amount_class: target_amount_class,
        getSuggestions: () => recipe_store.getItems(),
    })
)

function evaluateCraft() {
    let target_items = document.getElementsByClassName(target_item_class)
    let target_amounts = document.getElementsByClassName(target_amount_class)
    console.assert(target_items.length === target_amounts.length)

    planner.clearTargets()
    for (let i = 0; i < target_items.length; i++) {
        planner.addTarget(target_items[i].value, parseInt(target_amounts[i].value))
    }
    planner.recalculate(recipe_store)
    redraw()
}

function redraw() {
    drawStorage()
    drawNodes()
}

function drawAddItem(item, amount) {
    console.assert((item === undefined) === (amount === undefined))

    let input = itemWithAmount({
        div_class: storage_div_class,
        input_item_class: storage_item_class,
        input_amount_class: storage_amount_class,
        getSuggestions: () => recipe_store.getItems(),
        item,
        amount,
    })
    add_storage_div.replaceChildren(input)
    redraw()
}

add_to_storage_button.addEventListener("click", () => {
    let items = document.getElementsByClassName(storage_item_class)
    let amounts = document.getElementsByClassName(storage_amount_class)
    for (let i = 0; i < items.length; i++) {
        let item = items[i].value
        let amount = parseInt(amounts[i].value)
        planner.addToStorage(item, amount, recipe_store)
    }
    drawAddItem()
})
drawAddItem()

function drawStorage() {
    let ul = document.createElement("ul")
    for (let {item, amount} of planner.getStorage().items()) {
        let li = document.createElement("li")

        let rm = document.createElement("button")
        rm.append("Del")
        rm.addEventListener("click", () => {
            planner.setAmountInStorage(item, 0, recipe_store)
            redraw()
        })
        let edit = document.createElement("button")
        edit.append("Edit")
        edit.addEventListener("click", () => {
            planner.setAmountInStorage(item, 0, recipe_store)
            redraw()
            drawAddItem(item, amount)
        })

        li.append(`${item} x${amount}`, rm, edit)
        ul.append(li)
    }
    storage_div.replaceChildren(ul)
}

function drawNodes() {
    let ol = document.createElement("ol")
    for (let node of planner.getNodes()) {
        let li = document.createElement("li")
        let chk = document.createElement("input")
        chk.type = "checkbox"
        chk.checked = planner.isCompleted(node)
        chk.disabled = !(chk.checked && planner.isAvailableToUncheck(node) || !chk.checked && planner.isAvailableToCheck(node))

        chk.addEventListener("click", () => {
            planner.setCompleted(node, chk.checked)
            redraw()
        })

        let text = ""
        if (node.kind === Node.GET_KIND) {
            text = `Get ${node.item} x${node.amount}`
        } else {
            text = `Craft (${node.recipe.print()}) x${node.instances}`
        }
        li.append(chk, text)
        ol.append(li)
    }
    steps_div.replaceChildren(ol)
}
