import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Provide a custom `fetch` implementation as an option
const supabase = createClient('https://kmboytfgvohwtezkkzgq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttYm95dGZndm9od3RlemtremdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIxNzA3NTEsImV4cCI6MjAyNzc0Njc1MX0.4RlvHhaaPmeFL3rg8_yvpwAAd09exiOItZEeok3z1Cs')

console.log('Supabase Instance: ', supabase);


async function fetchData(){
    const {data, error} = await supabase.from('People').select();
    
    if (error){
        console.log('Error: ', error);

    } 
    else{
        console.log('Data: ', data);
        return data;

    } 
}



const submitButtonPS = document.getElementById('submitbuttonPS');
const link = document.getElementById("search-status");


submitButtonPS.addEventListener('click', e => { 
    console.log('I have been clicked');
    const searchDrivLic = document.getElementById('driverlicense').value
    const searchDrivName = document.getElementById('drivername').value

    fetchData().then(data => {
        let found = outputSearchData(data,searchDrivName,searchDrivLic);
        console.log("value of found is",found)
        if(!found)link.textContent = "Invalid Search";
        else link.textContent = "Search Successful";        
    });
    
    document.getElementById('driverlicense').value = ''
    document.getElementById('drivername').value = ''

})




function outputSearchData(data,driverName,driverLicense){
    //check requirments for when nothing is entered into both search options
    let found = false
    const main = document.querySelector('main');
    const outputPanel = document.getElementById('db-output')
    // clears search results that are already displaying on the screen
    outputPanel.innerHTML = '';



    if(driverName =='' && driverLicense == ''){
        for(let i =0; i<data.length;i++){
            const output = document.createElement("div");
            outputPanel.append(addOutput(data[i],output))
        }
        found = true
    }else if(driverName != ''){ //searchs only by driver name
        for(let i =0; i<data.length;i++){
            if(data[i].Name.includes(driverName)){
                found = true;
                const output = document.createElement("div");
                outputPanel.append(addOutput(data[i],output))
            }
        }
    }else if(driverLicense!= ''){
        for(let i =0; i<data.length;i++){
            if(data[i].LicenseNumber.includes(driverLicense)){
                const output = document.createElement("div");
                found = true;
                outputPanel.append(addOutput(data[i],output))

            }
        }
    }
    return found;
    
}



function addOutput(data, output){
    output.setAttribute("class","person")
    output.innerText = "personid:"+data.PersonID+"\nname:"+data.Name+"\naddress:"+data.Address+"\nlicensenumber:"+data.LicenseNumber+"\nexpirydata:"+data.ExpiryDate;

    return output
}