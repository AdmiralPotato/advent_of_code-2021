const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const fish = fs.readFileSync(dataPath, 'utf-8')
	.trim()
	.split(',')
	.map((string) => parseInt(string, 10))

const daysUntilFisReproduceAgain = 6
const daysUntilFisReproduceFirstTime = 8

const tick = (feesh) => {
	const fishes = feesh.slice()
	const newFishes = []
	fishes.forEach((value, index) => {
		let newValue = value - 1
		if(newValue === -1) {
			newValue = daysUntilFisReproduceAgain
			newFishes.push(daysUntilFisReproduceFirstTime)
		}
		fishes[index] = newValue
	})
	return fishes.concat(newFishes)
}

let mutableFish = fish.slice()
const days = 80
for (let day = 0; day < days; day++) {
	mutableFish = tick(mutableFish)
}

const result = {
	days,
	fishCount: mutableFish.length,
}
console.log(JSON.stringify(result, null, '  '))
