const craft_targets = document.getElementById("items_to_craft_list")

const storage_div = document.getElementById("storage")
const requirements_div = document.getElementById("requirements")
const actions_div = document.getElementById("actions")

const craft_button = document.getElementById("calculate_tree")
const add_item_to_craft_button = document.getElementById("add_item_to_craft_button")

function addNewCraftTargetField() {
    let input_block = document.createElement("div")
    let new_input = document.createElement("input")
    let br = document.createElement("br")
    let amt = document.createElement("input")
    let rm = document.createElement("button")
    rm.addEventListener("click", (e) => input_block.remove())
    rm.append("Del")
    new_input.type = "text"
    new_input.className = "item_to_craft"
    amt.type = "number"
    amt.value = 1
    amt.className = "item_to_craft_amount"
    input_block.append(new_input, "x", amt, rm, br)
    craft_targets.append(input_block)

    new Suggestions(input_block, new_input, () => recepie_store.getItems())
}

addNewCraftTargetField()
add_item_to_craft_button.addEventListener("click", addNewCraftTargetField)

let current_storage = new Storage()
let completed_steps = new Map()
let requirements = new Map()
let to_craft = new Map()

function evaluateCraft() {
    let items = []
    const item_inputs = document.getElementsByClassName("item_to_craft")
    for (const item of item_inputs) {
        items.push(item.value)
    }
    let amounts = []
    const amount_inputs = document.getElementsByClassName("item_to_craft_amount")
    for (const amount of amount_inputs ) {
        amounts.push(parseInt(amount.value))
    }

    completed_steps.clear()
    let actions = recepie_store.evaluate(items, amounts, current_storage)
    summarizeActions(actions)
    redraw()
}

craft_button.addEventListener("click", () => evaluateCraft())

function drawStorage() {
    let ul = document.createElement("ul")
    for (let {item, amount} of current_storage.items()) {
        let li = document.createElement("li")

        let rm = document.createElement("button")
        rm.append("Del")
        rm.addEventListener("click", () => {
            current_storage.get(item, amount)
            evaluateCraft()
        })

        li.append(`${item} x${amount}`, rm)
        ul.append(li)
    }
    storage_div.replaceChildren(ul)
}

function redraw() {
    drawStorage()
    drawRequirements()
    drawToCraft()
}

function drawRequirements() {
    let ul = document.createElement("ul")
    for (let [item, amount] of requirements) {
        let li = document.createElement("li")
        let chk = document.createElement("input")
        chk.type = "checkbox"
        chk.checked = completed_steps.get(item)
        chk.addEventListener("click", () => {
            completed_steps.set(item, chk.checked)

            if (chk.checked) {
                current_storage.put(item, amount)
            } else {
                current_storage.get(item, amount)
            }

            redraw()
        })

        li.append(chk, `${item} x${amount}`)
        ul.append(li)
    }
    requirements_div.replaceChildren(ul)
}

function drawToCraft() {
    let ul = document.createElement("ul")
    for (let [output, {recepie, instances}] of to_craft) {
        let li = document.createElement("li")
        let chk = document.createElement("input")
        chk.type = "checkbox"
        chk.checked = completed_steps.get(output)
        chk.disabled = false
        for (let i = 0; i < recepie.inputs.length; i++) {
            let item = recepie.inputs[i]
            let amount = recepie.input_amounts[i]
            if (completed_steps.has(item) && completed_steps.get(item)) {
                continue
            }
            if (current_storage.has(item) && current_storage.cur(item) >= amount) {
                continue
            }
            chk.disabled = true
            break
        }

        let amount = instances * recepie.output_amount
        chk.addEventListener("click", () => {
            completed_steps.set(output, chk.checked)

            if (chk.checked) {
                current_storage.put(output, amount)
                for (let i = 0; i < recepie.inputs.length; i++) {
                    current_storage.get(recepie.inputs[i], recepie.input_amounts[i] * instances)
                }
            } else {
                current_storage.get(output, amount)
                for (let i = 0; i < recepie.inputs.length; i++) {
                    current_storage.put(recepie.inputs[i], recepie.input_amounts[i] * instances)
                }
            }

            redraw()
        })

        li.append(chk, `(${recepie.print()}) x${instances}`)
        ul.append(li)
    }
    actions_div.replaceChildren(ul)
}

function summarizeActions(actions) {
    requirements = new Map()
    to_craft = new Map()

    for (let a of actions) {
        if (a.kind === 0) {
            let item = a.item
            let amount = a.amount
            if (!requirements.has(item)) requirements.set(item, amount)
            else requirements.set(item, requirements.get(item) + amount)

            completed_steps.set(item, false)
        } else if (a.kind === 1) {
            if (!to_craft.has(a.recepie.output)) to_craft.set(a.recepie.output, {
                instances: 0,
                recepie: a.recepie
            })
            let obj = to_craft.get(a.recepie.output)
            obj.instances += a.instances
            completed_steps.set(a.recepie.output, false)
        } else {
            console.assert(false, a)
        }
    }

    return {requirements, to_craft}
}
