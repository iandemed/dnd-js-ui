
/* This is the base api url to get all of the monsters in the
Dungeons and Dragons 5th Edition SRD
*/
const url = "https://www.dnd5eapi.co/api/monsters"

let container = document.querySelector(".container")


fetch(`${url}`)
    .then(res => res.json())
    .then(data => {
        for(let i = 0; i < 10; i++){
            fetch(`${url}/${data.results[i].index}`)
            .then(res => res.json())
            .then(data => {
    
                // Create an accordion button for all of the creatures in the array that
                // was passed into the loop
                let btn = document.createElement("button")
                btn.innerHTML = `<p>${data.name}</p> <p>CR ${data.challenge_rating}</p>`
                btn.classList.add("accordion")
                
                container.appendChild(btn)
    
    
                let monsterSheet = document.createElement("div")
                monsterSheet.classList.add("monster-sheet")
    
                statBlock = createStatBlock(data)
                vitalsBlock = createVitalsBlock(data)
                secondaryStatsBlock = createSecondaryStatsBlock(data)
    
    
                // Add all of the created divs to the monster's character sheet
                monsterSheet.appendChild(vitalsBlock)
                monsterSheet.appendChild(statBlock)
                monsterSheet.appendChild(secondaryStatsBlock)
    
                if (data.special_abilities){
                    abilitiesBlock = createAbilitiesBlock(data.special_abilities)
                    monsterSheet.appendChild(abilitiesBlock)
                }
    
                container.appendChild(monsterSheet)
    
                // Add event listeners to trigger the animations for the accoridans
                btn.addEventListener("click", (e) => {
                    let monsterSheet = e.target.nextElementSibling
                    console.log(monsterSheet)
            
                    if (monsterSheet.style.maxHeight){
                        monsterSheet.style.maxHeight = null
                    } else{
                        monsterSheet.style.maxHeight = `${monsterSheet.scrollHeight}px`
                    }
                })
            })
        }
    })


// for (let i = 0; i < creatures.length; i++){
//     fetch(`${url}/${creatures[i]}`)
        
// }


/* -------------------------------------------------- 
   Helper functions
-------------------------------------------------- */


/*Helper function that mainly focuses on capitalizing the second word
in passive perception */
function titleCaseSecondWord (word){
    
    let wordArray = word.split("_")

    if (wordArray.length > 1){
        let str = wordArray[1]
        wordArray[1] = str.charAt(0).toUpperCase() + str.slice(1)
    }
    return wordArray.join(" ")
}
/* Returns the ability score modifier for any ability that we put in to
the function. It is convention in Dungeons and Dragons to round down
numbers. */
function abilityModifier(ability){
    return Math.floor((ability - 10)/2)
}
    

function pTagWrap(str){
    return `<p>${str}</p>`
}

/* -------------------------------------------------- 
   Functions to process data from the JSON and 
   format it for the website
-------------------------------------------------- */

function prepareSpeed(speed){
   let speedString = "<strong> Speed </strong>"

   
    for (let key in speed){
        if (key === "walk"){
            speedString += ` ${speed[key]}`
        } else {
            /* The basline assumption is that creatures can walk just like
            the player characters. We have to specify if they are able to
            fly or swim at different speeds */
            speedString += `, ${key} ${speed[key]}`
        }
    }
   
    return pTagWrap(speedString)
}

function prepareStatRow(array, h2 = false){
    for(i = 0; i < array.length; i++){
        
        if (h2){
            array[i] = `<h2>${array[i]}</h2>`
        }   else{
            array[i] = pTagWrap(array[i])
        }
    }

    return array.join(" ")
}

/* Create strings for Saving Throws and skill proficiences. Characters and monsters in
Dungeons and Dragons gain a bonus to any roll that they are proficient in to represent
their increased skill compared to a layman. proficiencies are saved as an array of objects
with the objects names being strings we need to parse for more information*/
function prepareProficiencies(proficiencies){
    let savingThrows = "<strong> Saving Throws </strong>"
    let skills = "<strong> Skills </strong>"

    let str = ""

    proficiencies.forEach(obj => {
        strLength = obj.name.length

        if(obj.name.includes("Saving Throw:")){
            savingThrows +=`${obj.name.substr(13,strLength)}+${obj.value},` 
        }

        if(obj.name.includes("Skill:")){
            skills += `${obj.name.substr(6,strLength)}+${obj.value},`
        }
    });
    
    /* Monsters do not always have both skill and saving throw proficiencies,
     as a result we need to determine if a specific monster has them and
     include them as appropriate.
     
     Currently I use a naive approach of measuring the length of the strings
     I intialized at the start of the function */
    let stLength = savingThrows.length
    let skLength = skills.length
    if (stLength > 33){
        str += pTagWrap(savingThrows.substr(0, stLength - 1))
    }
    if (skLength > 26){
        str += pTagWrap(skills.substr(0,skLength - 1))
    }

    return str
}

function prepareResistanceandImmunity(str, dmg_type){
   
    let strtLength = str.length
    
    for(let i = 0; i < dmg_type.length; i++){
        
        if(str.includes("Condition Immunities")){
            
            if (i === 0) {
                str += `${dmg_type[i].name}`
            } else {
                str += `, ${dmg_type[i].name}`
            }
            
        } else{
            /* We want to make sure to correctly format the immunities and
            resistances for clarity. For example, there are a bevy of
            monsters that are resistant or immune convential weapon damage 
            (piercing, slashing, and bludgeoning) that is not cause by a 
            magical and/or silvered weapon. We want to make sure it is
            clear to the reader that it applies to ALL of those types of
            damage and not just the one that comes last
            */
            if (i === 0) {
                str += `${dmg_type[i]}`
            }else if(dmg_type[i].includes(',')){
                str += `; ${dmg_type[i]}`
            } else {
                str += `, ${dmg_type[i]}`
            }
        }
        
    }
    
    /* return nothing if the monster does not have any resistances,
     vulnerabilites, or immunities */
    if (str.length > strtLength){
        return pTagWrap(str)
    } else{
        return ""
    }

}

function prepareSenses(senses){
    let sensesStr = "<strong> Senses </strong>"

    for (let key in senses){
        sensesStr += ` ${titleCaseSecondWord(key)} ${senses[key]},`
    }

    return sensesStr.substring(0, sensesStr.length-1)
}


function prepareAbilities(obj){
    
    let usage = obj.usage
    let str = ""


    if (usage){
        str = `<p><strong>${obj.name} (${usage.times} ${usage.type}).</strong></p> <p>${obj.desc}</p>`
    } else{
        str = `<p><strong>${obj.name}.</strong></p> <p>${obj.desc}</p>` 
    }

    return str
}


/* -------------------------------------------------- 
   Functions to dynamically create HTML elements
-------------------------------------------------- */

function createStatBlock(data){

    // Initialize the stats variables
    let statsArray = []    
    statsArray[0] = data.strength
    statsArray[1] = data.dexterity
    statsArray[2] = data.constitution
    statsArray[3] = data.intelligence
    statsArray[4] = data.wisdom
    statsArray[5] = data.charisma

    let statsModArray = statsArray.map(abilityModifier)
    let statsStrArray = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]

    let statsBlock = document.createElement("div")
    statsBlock.classList.add("stat-block", "maroon")

    statsBlock.innerHTML =  prepareStatRow(statsStrArray, true) + prepareStatRow(statsArray) + prepareStatRow(statsModArray)

    return statsBlock
}

function createVitalsBlock(data){

    let vitalsBlock = document.createElement("div")
    let con = data.constitution


    let ac = pTagWrap(`<strong> Armor Class </strong> ${data.armor_class}`)
    let hp = pTagWrap(`<strong> Hit Points </strong> ${data.hit_points} (${data.hit_dice}+${abilityModifier(con)})`)
    
    vitalsBlock.innerHTML = ac + hp + prepareSpeed(data.speed)
    vitalsBlock.classList.add("maroon")

    return vitalsBlock
}

function createSecondaryStatsBlock(data){
    
    let secondaryStatsBlock = document.createElement("div")
    
    secondaryStatsBlock.innerHTML += prepareProficiencies(data.proficiencies)

    secondaryStatsBlock.innerHTML += prepareResistanceandImmunity("<strong> Damage Vulnerabilities </strong>", data.damage_vulnerabilities)
    secondaryStatsBlock.innerHTML += prepareResistanceandImmunity("<strong> Damage Resistances </strong>", data.damage_resistances)
    secondaryStatsBlock.innerHTML += prepareResistanceandImmunity("<strong> Damage Immunities </strong>", data.damage_immunities)
    secondaryStatsBlock.innerHTML += prepareResistanceandImmunity("<strong> Condition Immunities </strong>", data.condition_immunities)
    secondaryStatsBlock.innerHTML += prepareSenses(data.senses)

    secondaryStatsBlock.innerHTML += pTagWrap(`<strong> Languages </strong> ${data.languages}`)
    secondaryStatsBlock.classList.add("maroon")

    return secondaryStatsBlock
}

function createAbilitiesBlock(special_abilities){

    let abilitiesBlock = document.createElement("div")

    for (let i=0; i < special_abilities.length; i++){
        abilitiesBlock.innerHTML += prepareAbilities(special_abilities[i])
    }

    return abilitiesBlock
}