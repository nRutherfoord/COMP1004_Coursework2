import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Provide a custom `fetch` implementation as an option
const supabase = createClient('https://kmboytfgvohwtezkkzgq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttYm95dGZndm9od3RlemtremdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIxNzA3NTEsImV4cCI6MjAyNzc0Njc1MX0.4RlvHhaaPmeFL3rg8_yvpwAAd09exiOItZEeok3z1Cs')

console.log('Supabase Instance: ', supabase);

const addButton = document.getElementById('addbutton');

const originalForm = document.getElementById("form-list").innerHTML;

addButton.addEventListener('click', async e => {
    const registration = document.getElementById('rego').value
    const make = document.getElementById('make').value
    const model = document.getElementById('model').value
    const colour = document.getElementById('colour').value
    const owner  = document.getElementById('owner').value

    if (await checkVehicleFields(registration, make, model, colour, owner, true)) {
        let ownerID = await getOwnerId(owner);
        await addVehicle(registration, make, model, colour, ownerID, true);
        resetPage();

    }
})



//caseType true is for when checking fields for only adding vehicle
//caseType false is for when checking fields for adding a person
async function checkVehicleFields(registration, make, model, colour, owner, toCheck) {
    try {
        if (registration == "" || make == "" || model == "" || colour == "" || owner == "") {
            console.log("Error. At least one field is empty.")
            document.getElementById("message").innerText = ("Error. At least one field is empty.");
            return false;
        } else if (await checkField('Vehicles', 'VehicleID', registration)) {
            console.log("Error. Vehicle Registration already exists");
            document.getElementById("message").innerText = ("Error. Vehicle registration already exists");
            return false;
        }
        else if (!(await checkField('People', 'Name', owner)) && toCheck) {
            console.log("Vehicle owner does not exist")
            document.getElementById("message").innerText = ("Vehicle owner does not exist");
            await addNewOwner(registration, make, model, colour);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking vehicle fields: ', error);
        return false;
    }
}


async function checkField(tableName, columnName, value) {
    const { data, error } = await supabase.from(tableName).select();
    if (error) {
        console.error('Error fetching data: ', error);
        return false;
    } else {
        for (let i = 0; i < data.length; i++) {
            if (data[i][columnName] == value) {
                return true;
            }
        }
    }
    return false;
}

async function getOwnerId(owner){
    const { data, error } = await supabase.from('People').select();
    if (error) {
        console.error('Error fetching data: ', error);
        return false;
    } else {
        for (let i = 0; i < data.length; i++) {
            if (data[i].Name == owner) {
                return data[i].PersonID;
            }
        }
    }
    return null;
}

async function addVehicle(registration, make, model, colour, ownerID, outputMessage) {
    const { error } = await supabase.from('Vehicles').insert([
        {
            VehicleID: registration,
            Make: make,
            Model: model,
            Colour: colour,
            OwnerID: ownerID,
        },
    ])

    if (error) {
        console.error('Error inserting data: ', error);
        document.getElementById("message").innerText = "Error. Could not add vehicle.";
        return false
    } else if (outputMessage) {
        document.getElementById("message").innerText = "Vehicle added successfully";
    } else {
        return true
    }
}

async function addNewOwner() {
    // remove the button and vehicle owner box and move the message text up 
    // and add a new message saying to add a new person
    var ul = document.getElementById("form-list");
    var fifthChild = ul.children[5];
    var sixthChild = ul.children[6];
    var seventhChild = ul.children[7];
    fifthChild.innerHTML = '<strong>Add a new person</strong>'
    sixthChild.innerHTML = '';


    // Define the data for the list items
    var data = [
        { label: 'Person ID', type: 'text', id: 'personid' },
        { label: 'Full Name', type: 'text', id: 'name' },
        { label: 'Address', type: 'text', id: 'address' },
        { label: 'Date of Birth', type: 'date', id: 'dob' },
        { label: 'License', type: 'text', id: 'license' },
        { label: 'License expiry date', type: 'date', id: 'expire' }
    ];

    //Selct the unordered list
    var ul = document.getElementById('form-list');

    // Loop through the data and create a list item for each object
    data.forEach(item => {
        var liElement = document.createElement('li');
        liElement.innerHTML = `<label for="${item.id}"> ${item.label}:</label><input type="${item.type}" id="${item.id}" placeholder="" />`;
        ul.insertBefore(liElement, seventhChild);
    });

    const button = createButton();
    ul.insertBefore(button, seventhChild);

}

function createButton() {
    const button = document.createElement('button');
    button.type = "button";
    button.className = "submitbutton";
    button.name ="Add owner"
    button.id = "addPerson";
    button.textContent = "Add owner";

    button.addEventListener('click', peopleButtonPressed);

    return button;
}

async function peopleButtonPressed() {

    //vehicle fields
    const registration = document.getElementById('rego').value;
    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;
    const colour = document.getElementById('colour').value;

    //people fields
    const personId = document.getElementById('personid').value
    const name = document.getElementById('name').value
    const address = document.getElementById('address').value
    const dob = document.getElementById('dob').value
    const license = document.getElementById('license').value
    const expire = document.getElementById('expire').value

    //if fields from vehicle or people fields are empty then an error message will be displayed
    if (await checkPeopleFields(name, address, dob, license, expire, personId) && await checkVehicleFields(registration, make, model, colour, personId, false)) {
        if (await addPeople(personId, name, address, dob, license, expire) && await addVehicle(registration, make, model, colour, personId, false)) {
            document.getElementById("message").innerText = "Vehicle added successfully";
            resetPage();
        }

    }
}

async function checkPeopleFields(name, address, dob, license, expire, personId) {
    if (name == "" || address == "" || dob == "" || license == "" || expire == "" || personId == "") {
        document.getElementById('message').innerText = ("Error. At least one field is empty.");
        console.log("Error. At least one field is empty.")
        return false;
    } else if (await checkField('People', 'PersonID', personId)) {
        document.getElementById('message').innerText = ("Error. Person ID already exists");
        console.log("Error. Person ID already exists -2 ");
        return false;
    } else if(await checkField('People','LicenseNumber', license)){
        document.getElementById('message').innerText = ("Error. License number already exists");
        console.log("Error. Person License number already exists");
        return false;
    }

    return true;
}

async function addPeople(personId, name, address, dob, license, expire) {

    const { error } = await supabase.from('People').insert([
        {
            PersonID: personId,
            Name: name,
            Address: address,
            DOB: dob,
            LicenseNumber: license,
            ExpiryDate: expire,
        },
    ])

    if (error) {
        console.error('Error inserting data: ', error);
        document.getElementById("message").innerText = "Error. Could not add person.";
        return false;
    } else {
        return true;
    }
}


function resetPage(){
    var ul = document.getElementById("form-list");
    const message = document.getElementById("message").innerText;
    ul.innerHTML = originalForm;
    document.getElementById("message").innerText = message;
}