const recepie_table = document.getElementById("recepie_table")
const recepie_form = document.getElementById("new_recepie_form")
const recepie_inputs_div = document.getElementById("recepie_inputs")
const add_input_button = document.getElementById("add_input_button")
const add_recepie_button = document.getElementById("add_recepie_button")

let recepie_store = new RecepieStore()

function newInputForm() {
    let input_block = document.createElement("div")
    let new_input = document.createElement("input")
    let br = document.createElement("br")
    let amt = document.createElement("input")
    let rm = document.createElement("button")
    rm.addEventListener("click", (e) => input_block.remove())
    rm.append("Del")
    new_input.type = "text"
    new_input.className = "recepie_input"
    amt.type = "number"
    amt.value = 1
    amt.className = "recepie_input_amount"
    recepie_inputs_div.append(input_block)
    input_block.append(new_input, "x", amt, rm, br)
}
newInputForm()

add_input_button.addEventListener("click", newInputForm)

function newRecepie() {
    const output = document.getElementById("recepie_output").value
    const output_amount = document.getElementById("recepie_output_amount").value
    const machine = document.getElementById("recepie_machine").value
    console.log(output, output_amount, machine)
    
    let inputs_list = []
    const inputs = document.getElementsByClassName("recepie_input")
    for (const input of inputs) {
        inputs_list.push(new Item(input.value))
    }
    let input_amounts_list = []
    const input_amounts = document.getElementsByClassName("recepie_input_amount")
    for (const input_amount of input_amounts) {
        input_amounts_list.push(parseInt(input_amount.value))
    }

    return new Recepie(inputs_list, input_amounts_list, new Item(output), output_amount, machine)
}

function clearRecepies() {
    recepie_store = new RecepieStore()
    recepie_table.replaceChildren() 
}

function addRecepieToTable(recepie) {
    let new_row = document.createElement("tr")
    let output = document.createElement("th")
    output.scope = "row"
    output.append(`${recepie.output.name} x${recepie.output_amount}`)

    let inputs = document.createElement("td")
    for (let i = 0; i < recepie.inputs.length; i++) {
        inputs.append(`${recepie.inputs[i].name} x${recepie.input_amounts[i]}, `)
    }

    let machine = document.createElement("td")
    machine.append(recepie.machine)

    let rm = document.createElement("button")
    rm.addEventListener("click", (e) => new_row.remove())
    rm.append("Del")

    recepie_table.append(new_row)
    new_row.append(output, inputs, machine, rm)
}

add_recepie_button.addEventListener("click", (e) => {
    let r = newRecepie()
    recepie_store.add_recepie(r)
    addRecepieToTable(r)
})
