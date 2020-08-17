
/* This is the base api url to get all of the monsters in the
Dungeons and Dragons 5th Edition SRD
*/
const url = "https://www.dnd5eapi.co/api/monsters"

console.log("This is the api url: " + url)


let creatureNames = ['bandit', 'skeleton', 'aboleth', 'tarrasque']

for (let i = 0; i < creatureNames.length; i++){
    fetch(`${url}/${creatureNames[i]}`)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            console.log(data.name)

            // Initialize the stats variables
            let str = data.strength
            let dex = data.dexterity
            let con = data.constitution
            let int = data.intelligence
            let wis = data.wisdom
            let cha = data.charisma


            let typeLine = `${data.size} ${data.type}`

            // Not all creatures have sub-types
            if(data.subtype){
                typeLine += ` (${data.subtype}), ${data.alignment}`
            } else{
                typeLine += `, ${data.alignment}`
            }

            console.log(typeLine)
            console.log(`Armor Class: ${data.armor_class}`)
            console.log(`Hit Points: ${data.hit_points} (${data.hit_dice}+${abilityModifier(con)})`)

            console.log(prepareSpeed(data.speed))

            /* Create strings for Saving Throws and skill proficiences */
            let savingThrows = "Saving Throws:"
            let skills = "Skills:"
            data.proficiencies.forEach(obj => {
                strLength = obj.name.length

                if(obj.name.includes("Saving Throw:")){
                    savingThrows += `${obj.name.substr(13,strLength)}+${obj.value},` 
                }

                if(obj.name.includes("Skill:")){
                    skills += `${obj.name.substr(6,strLength)}+${obj.value},`
                }
            });


            let stLength = savingThrows.length
            let skLength = skills.length
            if (stLength > 16){
                console.log(savingThrows.substr(0, stLength - 1))
            }
            if (skLength > 8){
                console.log(skills.substr(0,skLength - 1))
            }

            console.log(prepareResistanceandImmunity("Damage Vulnerabilities", data.damage_vulnerabilities))
            console.log(prepareResistanceandImmunity("Damage Resistances", data.damage_resistances))
            console.log(prepareResistanceandImmunity("Damage Immunities", data.damage_immunities))
            console.log(prepareResistanceandImmunity("Condition Immunities", data.condition_immunities))
            console.log(prepareSenses(data.senses))

            console.log(`Languages: ${data.languages}`)

            if (data.special_abilities){
                for (let i=0; i < data.special_abilities.length; i++){
                    console.log(prepareAbilities(data.special_abilities[i]))
                }
            }
        })
}



let acc = document.querySelector(".accordion")

acc.addEventListener("click", (e) => {
    let statBlock = e.target.nextElementSibling

    if (statBlock.style.maxHeight){
        statBlock.style.maxHeight = null
    } else{
        statBlock.style.maxHeight = `${statBlock.scrollHeight}px`
    }
})

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
   let speedString = "Speed:"

    for (let key in speed){
        if (key === "walk"){
            speedString += ` ${speed[key]},`
        } else {
            /* The basline assumption is that creatures can walk just like
            the player characters. We have to specify if they are able to
            fly or swim at different speeds */
            speedString += ` ${key} ${speed[key]},`
        }
    }
   
    return speedString.substring(0, speedString.length-1)
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
        str = `${obj.name} (${usage.times} ${usage.type}). ${obj.desc}`
    } else{
        str = `${obj.name}. ${obj.desc}` 
    }

    return str
}