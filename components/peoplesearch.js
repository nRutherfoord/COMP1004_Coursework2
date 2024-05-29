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
const link = document.getElementById("message");


submitButtonPS.addEventListener('click', e => { 
    const searchDrivLic = document.getElementById('license').value
    const searchDrivName = document.getElementById('name').value

    fetchData().then(data => {
        let found = outputSearchData(data,searchDrivName,searchDrivLic);
        if(found == 0){
            link.textContent = "Error";
            document.getElementById("results").setAttribute("class","") //switches off the border of the output-box when its invalid

        }else if(found ==1){
            link.textContent = "Search successful"
            document.getElementById("results").setAttribute("class","results")
        }else{
            link.textContent = "No result found";
            document.getElementById("results").setAttribute("class","") //switches off the border of the output-box when its invalid
        };        
    });
    
    document.getElementById('license').value = ''
    document.getElementById('name').value = ''
})




function outputSearchData(data,driverName,driverLicense){
    //check requirments for when nothing is entered into both search options
    let found = 0
    const main = document.querySelector('main');
    const outputPanel = document.getElementById('results')
    // clears search results that are already displaying on the screen
    outputPanel.innerHTML = '';

    if((driverLicense == '' && driverName =='') || (driverLicense != '' && driverName !='')){
        return 0;        
    } else if(driverLicense!= ''){
        for(let i =0; i<data.length;i++){
            if(data[i].LicenseNumber.includes(driverLicense)){
                const output = document.createElement("div");
                found = 1;
                outputPanel.append(addOutput(data[i],output))

            }
        }

    }else if(driverName != ''){ //searchs only by driver name
        for(let i =0; i<data.length;i++){
            let name = data[i].Name.toLowerCase();
            driverName = driverName.toLowerCase();
            if(name.includes(driverName)){
                found = 1;
                const output = document.createElement("div");
                outputPanel.append(addOutput(data[i],output))
            }
        }
    }
    
    if(found ==0){
        found =2;
    }
    return found;
    
}

function addOutput(data, output){
    output.setAttribute("class","person")
    output.innerText = "personid:"+data.PersonID+"\nname:"+data.Name+"\naddress:"+data.Address+"\nlicensenumber:"+data.LicenseNumber+"\nexpirydata:"+data.ExpiryDate;

    return output
}