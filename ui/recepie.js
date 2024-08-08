const recepie_table = document.getElementById("recepie_table")
const recepie_form = document.getElementById("new_recepie_form")
const recepie_inputs_div = document.getElementById("recepie_inputs")
const add_input_button = document.getElementById("add_input_button")
const add_recepie_button = document.getElementById("add_recepie_button")
const reset_recepie_button = document.getElementById("reset_recepie_button")
const target_item = document.getElementById("target_item")
const target_amount = document.getElementById("target_amount")
const machine = document.getElementById("recepie_machine")
const machine_div = document.getElementById("machine_div")
const import_button = document.getElementById("import_recepies_button")
const export_button = document.getElementById("export_recepies_button")

import { RecepieStore, Recepie } from "../recepie.js"
import { Suggestions  } from "./suggestions.js"
import { saveAsTextFile, readFromTextFile } from "./files.js"
import { itemWithAmount } from "./components.js"

export let recepie_store = new RecepieStore()

new Suggestions(machine_div, machine, () => recepie_store.getMachines())

export_button.addEventListener("click", () => {
    let s = recepie_store.toString()
    saveAsTextFile("recepies.json", s)
})
import_button.addEventListener("click", () => {
    readFromTextFile(import_button.files[0], (s) => {
        recepie_store = RecepieStore.fromString(s);
        recepie_table.replaceChildren()
        for (let r of recepie_store.getAllRecepies()) {
            addRecepieToTable(r)
        }
    })
})

const input_item_class = "recepie_input_item"
const input_amount_class = "recepie_input_amount"
const input_class = "recepie_input_div"
recepie_inputs_div.replaceChildren(addRecepieInputForm())

add_input_button.addEventListener("click", () => {
    recepie_inputs_div.append(addRecepieInputForm())
})
add_recepie_button.addEventListener("click", () => {
    let r = readRecepie()
    console.log(r)
    recepie_store.addRecepie(r)
    clearRecepieForm()
    addRecepieToTable(r)
})
reset_recepie_button.addEventListener("click", () => {
    clearRecepieForm()
})

function addRecepieInputForm(item, amount) {
    return itemWithAmount(
        input_class, 
        input_item_class, 
        input_amount_class, 
        () => recepie_store.getItems(), 
        item, 
        amount
    )
}

function clearRecepieForm(recepie) {
    target_item.value = ""
    target_amount.value = 1
    machine.value = ""

    recepie_inputs_div.replaceChildren()
    if (recepie === undefined) {
        recepie_inputs_div.append(addRecepieInputForm())
    } else {
        target_item.value = recepie.output.item
        target_amount.value = recepie.output.amount
        machine.value = recepie.machine
        for (let {item, amount} of recepie.inputs) {
            recepie_inputs_div.append(addRecepieInputForm(item, amount))
        }
    }
}

function readRecepie() {
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

    return new Recepie(inputs, target, machine.value)
}


function addRecepieToTable(recepie) {
    let new_row = document.createElement("tr")
    let output = document.createElement("th")
    output.scope = "row"
    output.append(`${recepie.output.item} x${recepie.output.amount}`)

    let inputs = document.createElement("td")
    for (let {item, amount} of recepie.inputs) {
        inputs.append(`${item} x${amount}, `)
    }

    let machine = document.createElement("td")
    machine.append(recepie.machine)

    let rm = document.createElement("button")
    rm.addEventListener("click", (e) => {
        new_row.remove()
        recepie_store.removeRecepie(recepie)
    })
    rm.append("Del")

    let edit = document.createElement("button")
    edit.addEventListener("click", () => {
        new_row.remove()
        recepie_store.removeRecepie(recepie)
        clearRecepieForm(recepie)
    })
    edit.append("Edit")

    recepie_table.append(new_row)
    new_row.append(output, inputs, machine, rm, edit)
}
