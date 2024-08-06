const craft_input = document.getElementById("item_to_craft_input")
const craft_amount = document.getElementById("item_to_craft_input_amount")
const recepie_tree = document.getElementById("recepie_tree")
const craft_button = document.getElementById("item_to_craft_button")

function onCraftComputation() {
    let item = craft_input.value
    let plan = recepie_store.evaluate(item, parseInt(craft_amount.value))
    let new_tree = drawPlan(plan, 0)
    recepie_tree.replaceChildren(new_tree)
}

craft_button.addEventListener("click", onCraftComputation)

function drawPlan(plan, depth) {
    let { actions, extra } = plan
    let tree = document.createElement("ol")

    let leafs = new Map()
    for (let a of actions) {
        let li = document.createElement("li")
        switch (a.kind) {
            case 0:
                li.append(`Craft (${a.recepie.print()}) x${a.recepie_instances}`)
                break;
            case 1:
                li.append(`Take ${a.item} x${a.amount}`)
                break;
            case 2:
                li.append(`Get ${a.item} x${a.amount}`)
                if (!leafs.has(a.item)) {
                    leafs.set(a.item, 0)
                }
                leafs.set(a.item, leafs.get(a.item) + a.amount)
                break;
            case 3:
                li.append(`Store ${a.item} x${a.amount}`)
                break;

            default:
                console.assert(false)
                break;
        }
        tree.append(li)
    }

    let raw_res = document.createElement("h5")
    raw_res.append("Needed:")
    let raw_res_list = document.createElement("ul")
    for (let item of leafs.keys()) {
        let li = document.createElement("li")
        li.append(`${item} x${leafs.get(item)}`)
        raw_res_list.append(li)
    }

    tree.append(raw_res, raw_res_list)

    let extra_res = document.createElement("h5")
    extra_res.append("Extras:")
    let extra_list = document.createElement("ul")
    for (let item of extra.keys()) {
        let li = document.createElement("li")
        li.append(`${item} x${extra.get(item).extra_amount}`)
        extra_list .append(li)
    }
    tree.append(extra_res, extra_list)

    return tree
}
