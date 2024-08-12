import { Suggestions  } from "./suggestions.js"

// div_class, input_item_class, input_amount_class, getSuggestions?, onClick?, item?, amount?
export function itemWithAmount(args) {
    let div = document.createElement("div")
    div.className = args.div_class
    let item_input = document.createElement("input")
    item_input.type = "text"
    item_input.className = args.input_item_class 
    if (args.getSuggestions !== undefined){
        new Suggestions(div, item_input, args.getSuggestions)
    }

    let amount_input = document.createElement("input")
    amount_input.type = "number"
    amount_input.className = args.input_amount_class 
    amount_input.value = 1

    let del = document.createElement("button")
    del.addEventListener("click", (e) => {
        div.remove()
        if (args.onClick !== undefined) args.onClick(e)
    })
    del.append("Del")

    console.assert((args.item === undefined) === (args.amount === undefined))
    if (args.item !== undefined) {
        item_input.value = args.item
        amount_input.value = args.amount
    }
    
    div.append(item_input, "x", amount_input, del)
    return div
}
