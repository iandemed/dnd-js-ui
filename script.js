
/* This is the base api url to get all of the monsters in the
Dungeons and Dragons 5th Edition SRD
*/
const url = "https://www.dnd5eapi.co/api/monsters"

console.log("This is the api url: " + url)


// let creatureNames = ['bandit', 'skeleton', 'aboleth', 'tarrasque']

// for (let i = 0; i < creatureNames.length; i++){
//     fetch(`${url}/${creatureNames[i]}`)
//         .then(res => res.json())
//         .then(data => {
//             console.log(data)
//             console.log(data.name)


//             let typeLine = `${data.size} ${data.type}`

//             // Not all creatures have sub-types
//             if(data.subtype){
//                 typeLine += ` (${data.subtype}), ${data.alignment}`
//             } else{
//                 typeLine += `, ${data.alignment}`
//             }

//             console.log(typeLine)
//            


//         })
// }


let creatures = ['bandit', 'skeleton', 'aboleth']
let container = document.querySelector(".container")

for (let i = 0; i < creatures.length; i++){
    fetch(`${url}/${creatures[i]}`)
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
            monsterSheet.innerHTML = " Animal domain battle grid charm class constrict copper piece critical roll death domain earth domain elf domain energy drained favored class helpless lawful lethal damage miniature figure modifier paralysis poison shadow subschool spell domain stable starvation time domain travel domain."

            statBlock = createStatBlock(data)
            vitalsBlock = createVitalsBlock(data)



            // Add all of the created divs to the monster's character sheet
            monsterSheet.appendChild(vitalsBlock)
            monsterSheet.appendChild(statBlock)
            
            console.log(prepareProficiencies(data.proficiencies))

            if (data.special_abilities){
                abilitiesBlock = createAbilitiesBlock(data.special_abilities)
                monsterSheet.appendChild(abilitiesBlock)
            }

            container.appendChild(monsterSheet)

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

function prepareSenses(senses){
    let sensesStr = "Senses: "

    for (let key in senses){
        sensesStr += ` ${titleCaseSecondWord(key)} ${senses[key]},`
    }

    return sensesStr.substring(0, sensesStr.length-1)
}

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

/* Returns the ability score modifier for any ability that we put in to
the function. It is convention in Dungeons and Dragons to round down
numbers. */
function abilityModifier(ability){
    return Math.floor((ability - 10)/2)
}
    
function prepareResistanceandImmunity(str, dmg_type){
   
    let strtLength = str.length
    
    for(let i = 0; i < dmg_type.length; i++){
        
        if(str.includes("Condition Immunities")){
            str += `, ${dmg_type[i].name}`
        }else{
            /* We want to make sure to correctly format the immunities and
            resistances for clarity. For example, there are a bevy of
            monsters that are resistant or immune convential weapon damage 
            (piercing, slashing, and bludgeoning) that is not cause by a 
            magical and/or silvered weapon. We want to make sure it is
            clear to the reader that it applies to ALL of those types of
            damage and not just the one that comes last
            */
            if(dmg_type[i].includes(',')){
                str += `; ${dmg_type[i]}`
            } else {
                str += `, ${dmg_type[i]}`
            }
        }
        
    }
    
    /* return nothing if the monster does not have any resistances,
     vulnerabilites, or immunities */
    if (str.length > strtLength){
        return str.substring(0, str.length)
    }

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

function pTagWrap(str){
    return `<p>${str}</p>`
}

function prepareStatRow(array){
    for(i = 0; i < array.length; i++){
        array[i] = pTagWrap(array[i])
    }

    return array.join(" ")
}


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
    statsBlock.classList.add("stat-block")

    statsBlock.innerHTML =  prepareStatRow(statsStrArray) + prepareStatRow(statsArray) + prepareStatRow(statsModArray)
    console.log(statsBlock.innerHTML)


    return statsBlock
}

function createVitalsBlock(data){

    let vitalsBlock = document.createElement("div")
    let con = data.constitution


    let ac = pTagWrap(`<strong> Armor Class </strong> ${data.armor_class}`)
    let hp = pTagWrap(`<strong> Hit Points </strong> ${data.hit_points} (${data.hit_dice}+${abilityModifier(con)}`)
    
    vitalsBlock.innerHTML = ac + hp + prepareSpeed(data.speed)

    return vitalsBlock
}

function createAbilitiesBlock(special_abilities){

    let abilitiesBlock = document.createElement("div")

    for (let i=0; i < special_abilities.length; i++){
        abilitiesBlock.innerHTML += prepareAbilities(special_abilities[i])
    }

    return abilitiesBlock
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
//             console.log(prepareResistanceandImmunity("Damage Vulnerabilities", data.damage_vulnerabilities))
//             console.log(prepareResistanceandImmunity("Damage Resistances", data.damage_resistances))
//             console.log(prepareResistanceandImmunity("Damage Immunities", data.damage_immunities))
//             console.log(prepareResistanceandImmunity("Condition Immunities", data.condition_immunities))
//             console.log(prepareSenses(data.senses))

//             console.log(`Languages: ${data.languages}`)
