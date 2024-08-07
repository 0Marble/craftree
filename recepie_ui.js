const recepie_table = document.getElementById("recepie_table")
const recepie_form = document.getElementById("new_recepie_form")
const recepie_inputs_div = document.getElementById("recepie_inputs")
const add_input_button = document.getElementById("add_input_button")
const add_recepie_button = document.getElementById("add_recepie_button")
const reset_recepie_button = document.getElementById("reset_recepie_button")

let recepie_store = new RecepieStore()
new Suggestions(
    document.getElementById("machine_div"), 
    document.getElementById("recepie_machine"), 
    () => recepie_store.getMachines()
)

function newInputForm(item, amount) {
    let input_block = document.createElement("div")
    let new_input = document.createElement("input")
    let br = document.createElement("br")
    let amt = document.createElement("input")
    let rm = document.createElement("button")
    input_block.className = "recepie_input_block"
    rm.addEventListener("click", (e) => input_block.remove())
    rm.append("Del")
    new_input.type = "text"
    new_input.className = "recepie_input"
    amt.type = "number"
    amt.value = 1
    amt.className = "recepie_input_amount"
    recepie_inputs_div.append(input_block)
    input_block.append(new_input, "x", amt, rm, br)

    console.assert((item === undefined) === (amount === undefined))
    if (item !== undefined) {
        new_input.value = item
        amt.value = amount
    }

    new Suggestions(input_block, new_input, () => recepie_store.getItems())
}
resetRecepieForm()

function resetRecepieForm(recepie) {
    const output = document.getElementById("recepie_output")
    const output_amount = document.getElementById("recepie_output_amount")
    const machine = document.getElementById("recepie_machine")
    output.value = ""
    output_amount.value = 1
    machine.value = ""

    let inputs = recepie_inputs_div.getElementsByClassName("recepie_input_block")
    let to_remove = []
    for (let i of inputs) {
        to_remove.push(i)
    }
    for (let i of to_remove) {
        i.remove()
    }

    if (recepie !== undefined) {
        output.value = recepie.output
        output_amount.value = recepie.output_amount
        machine.value = recepie.machine
        for (let i = 0; i < recepie.inputs.length; i++) {
            newInputForm(recepie.inputs[i], recepie.input_amounts[i])
        }
    } else {
        newInputForm()
    }
}

add_input_button.addEventListener("click", () => newInputForm())
reset_recepie_button.addEventListener("click", () => resetRecepieForm())

function newRecepie() {
    const output = document.getElementById("recepie_output").value
    const output_amount = document.getElementById("recepie_output_amount").value
    const machine = document.getElementById("recepie_machine").value
    console.log(output, output_amount, machine)
    
    let inputs_list = []
    const inputs = document.getElementsByClassName("recepie_input")
    for (const input of inputs) {
        inputs_list.push(input.value)
    }
    let input_amounts_list = []
    const input_amounts = document.getElementsByClassName("recepie_input_amount")
    for (const input_amount of input_amounts) {
        input_amounts_list.push(parseInt(input_amount.value))
    }

    return new Recepie(inputs_list, input_amounts_list, output, output_amount, machine)
}

function clearRecepies() {
    recepie_store = new RecepieStore()
    recepie_table.replaceChildren() 
}

function addRecepieToTable(recepie) {
    let new_row = document.createElement("tr")
    let output = document.createElement("th")
    output.scope = "row"
    output.append(`${recepie.output} x${recepie.output_amount}`)

    let inputs = document.createElement("td")
    for (let i = 0; i < recepie.inputs.length; i++) {
        inputs.append(`${recepie.inputs[i]} x${recepie.input_amounts[i]}, `)
    }

    let machine = document.createElement("td")
    machine.append(recepie.machine)

    let rm = document.createElement("button")
    rm.addEventListener("click", (e) => {
        new_row.remove()
        recepie_store.remove_recepie(recepie)
    })
    rm.append("Del")

    let edit = document.createElement("button")
    edit.addEventListener("click", () => {
        new_row.remove()
        recepie_store.remove_recepie(recepie)
        resetRecepieForm(recepie)
    })
    edit.append("Edit")

    recepie_table.append(new_row)
    new_row.append(output, inputs, machine, rm, edit)
}

add_recepie_button.addEventListener("click", (e) => {
    let r = newRecepie()
    recepie_store.add_recepie(r)
    addRecepieToTable(r)
})
