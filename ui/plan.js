
const craft_targets = document.getElementById("targets_list")
const storage_div = document.getElementById("storage")
const requirements_div = document.getElementById("requirements")
const steps_div = document.getElementById("steps")
const craft_button = document.getElementById("evaluate_craft")
const add_target_button = document.getElementById("add_target")

import { Planner } from "../plan.js"
import { recepie_store } from "./recepie.js"
import { itemWithAmount } from "./components.js"

const target_item_class = "target_item_class"
const target_amount_class = "target_amount_class"
const target_div_class = "target_div_class"

let planner = new Planner()
craft_button.addEventListener("click", () => evaluateCraft())
add_target_button.addEventListener("click", () => {
    craft_targets.append(
        itemWithAmount(
            target_div_class, 
            target_item_class,
            target_amount_class,
            () => recepie_store.getItems(),
        ) 
    )
})

function evaluateCraft() {
    let target_items = document.getElementsByClassName(target_item_class)
    let target_amounts = document.getElementsByClassName(target_amount_class)
    console.assert(target_items.length === target_amounts.length)

    planner.clearTargets()
    for (let i = 0; i < target_items.length; i++) {
        planner.addTarget(target_items[i].value, parseInt(target_amounts[i].value))
    }
    planner.recalculate(recepie_store)
    redraw()
}

function redraw() {
    drawStorage()
    drawRequirements()
    drawToCraft()
}

function drawStorage() {
    let ul = document.createElement("ul")
    for (let {item, amount} of planner.getStorage().items()) {
        let li = document.createElement("li")

        let rm = document.createElement("button")
        rm.append("Del")
        rm.addEventListener("click", () => {
            planner.setAmountInStorage(item, 0, recepie_store)
            redraw()
        })

        li.append(`${item} x${amount}`, rm)
        ul.append(li)
    }
    storage_div.replaceChildren(ul)
}

function drawRequirements() {
    let ul = document.createElement("ul")
    for (let [item, amount] of planner.getRequirements()) {
        let li = document.createElement("li")
        let chk = document.createElement("input")
        chk.type = "checkbox"
        chk.addEventListener("click", () => {
            console.assert(chk.checked)
            chk.disabled = true
            planner.completeRequirement(item)
            redraw()
        })

        li.append(chk, `${item} x${amount}`)
        ul.append(li)
    }
    requirements_div.replaceChildren(ul)
}

function drawToCraft() {
    let ul = document.createElement("ul")
    for (let [item, {recepie, instances}] of planner.getSteps()) {
        let li = document.createElement("li")
        let chk = document.createElement("input")
        chk.type = "checkbox"
        chk.disabled = !planner.isStepAvailable(item)

        chk.addEventListener("click", () => {
            console.assert(chk.checked)
            chk.disabled = true
            planner.completeStep(item)
            redraw()
        })

        li.append(chk, `(${recepie.print()}) x${instances}`)
        ul.append(li)
    }
    steps_div.replaceChildren(ul)
}
