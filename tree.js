const craft_input = document.getElementById("item_to_craft_input")
const craft_amount = document.getElementById("item_to_craft_input_amount")
const recepie_tree = document.getElementById("recepie_tree")
const craft_button = document.getElementById("item_to_craft_button")

function onCraftComputation() {
    let item = craft_input.value
    let plan = recepie_store.crafting_plan(new Item(item), parseInt(craft_amount.value))
    let new_tree = drawPlan(plan, 0)
    recepie_tree.replaceChildren(new_tree)
}

craft_button.addEventListener("click", onCraftComputation)

function drawPlan(plan, depth) {
    let text = document.createElement("div")
    let spacing = "| ".repeat(depth)
    let item = `-${plan.item.print()} x${plan.amount}`
    if (plan.machine !== null) {
        item += ` @ ${plan.machine}`
    }
    text.append(spacing, item)
    if (plan.extra !== null) {
        text.append(" + {")
        for (let e of plan.extra) {
            text.append(`${e.item.print()} x${e.amount}, `)
        }
        text.append("}")
    }
    text.append(document.createElement("br"))
    for (let r of plan.reqs) {
        text.append(drawPlan(r, depth + 1))
    }
    return text
}
