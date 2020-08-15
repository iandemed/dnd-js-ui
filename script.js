
/* This is the base api url to get all of the monsters in the
Dungeons and Dragons 5th Edition SRD
*/
const url = "https://www.dnd5eapi.co/api/monsters"

console.log("This is the api url: " + url)


let creatureNames = ['bandit', 'aboleth']

for (let i = 0; i < creatureNames.length; i++){
    fetch(`${url}/${creatureNames[i]}`)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            console.log(data.name)
            console.log(`${data.size} ${data.type} (${data.subtype}), ${data.alignment}`)
            console.log(`Armor Class: ${data.armor_class}`)
            console.log(`Hit Points: ${data.hit_points} (${data.hit_dice})`)
            
            for (let key in data.speed){
                console.log(`Speed: ${data.speed[key]} (${key})`)
            }

            data.proficiencies.forEach(obj => {
                console.log(`${obj.name} ${obj.value}`) 
            });

            data.proficiencies.forEach(obj => {
                console.log(`${obj.name} +${obj.value}`) 
            });
            data.damage_vulnerabilities.forEach(obj => {
                console.log(`${obj.name} +${obj.value}`) 
            });
            data.damage_resistances.forEach(obj => {
                console.log(`${obj.name} +${obj.value}`) 
            });
            data.damage_immunities.forEach(obj => {
                console.log(`${obj.name} +${obj.value}`) 
            });
            data.condition_immunities.forEach(obj => {
                console.log(`${obj.name} +${obj.value}`) 
            });

            for (let key in data.senses){
                console.log(`${data.senses[key]}`)
            }

            console.log(`Languages: ${data.languages}`)

            if (data.special_abilities){
                data.special_abilities.forEach(obj => {
                    console.log(`${obj.name}. ${obj.desc}`)
                })
            }
        })
}