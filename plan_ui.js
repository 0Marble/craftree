const craft_targets = document.getElementById("items_to_craft_list")

const recepie_tree = document.getElementById("recepie_tree")
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

function onCraftComputation() {
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

    let plan = recepie_store.evaluate(items, amounts).topological_sort(items)
    recepie_tree.replaceChildren(drawPlan(plan))
}

craft_button.addEventListener("click", onCraftComputation)

function drawPlan(plan) {
    let list = document.createElement("ol")
    
    for (let node of plan) {
        let li = document.createElement("li")
        if (node.craft !== 0) {
            li.append(`Craft ${node.item} x${node.craft}`)
        } else {
            let bold = document.createElement("b")
            bold.append("Take ")
            li.append(bold, `${node.item} x${node.store}`)
        }
        if (node.store !== node.take && node.take !== 0) {
            console.assert(node.store > node.take)
            li.append(`(extra ${node.store - node.take})`)
        }
        list.append(li)
    }
    return list
}

