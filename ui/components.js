import { Suggestions  } from "./suggestions.js"

export function itemWithAmount(
    input_class, 
    input_item_class, 
    input_amount_class, 
    //// optional ////
    getSuggestions,
    item, 
    amount, 
) {
    let div = document.createElement("div")
    div.className = input_class 
    let item_input = document.createElement("input")
    item_input.type = "text"
    item_input.className = input_item_class 
    if (getSuggestions !== undefined){
        new Suggestions(div, item_input, getSuggestions)
    }

    let amount_input = document.createElement("input")
    amount_input.type = "number"
    amount_input.className = input_amount_class 
    amount_input.value = 1

    let del = document.createElement("button")
    del.addEventListener("click", (e) => {
        div.remove()
    })
    del.append("Del")

    console.assert((item === undefined) === (amount === undefined))
    if (item !== undefined) {
        item_input.value = item
        amount_input.value = amount
    }
    
    div.append(item_input, "x", amount_input, del)
    return div
}
