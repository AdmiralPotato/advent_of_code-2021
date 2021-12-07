const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const startingFish = fs.readFileSync(dataPath, 'utf-8')
	.trim()
	.split(',')
	.map((string) => parseInt(string, 10))

const daysUntilFisReproduceAgain = 6
const daysUntilFisReproduceFirstTime = 8

const makeEmptyAgeMap = () => {
	const fishAgeMap = {}
	for (let i = 0; i < daysUntilFisReproduceFirstTime + 1; i++) {
		fishAgeMap[i] = 0
	}
	return fishAgeMap
}
let fishAgeMap = makeEmptyAgeMap()

// initial population of age map from input data
startingFish.forEach((age) => {
	fishAgeMap[age] += 1
})
// end initial population

const tick = (fishAgeMap) => {
	const newAgeMap = makeEmptyAgeMap()
	Object.keys(fishAgeMap).forEach((countdown) => {
		let newValue = parseInt(countdown, 10) - 1
		const numberOfFishWithThisCooldown = parseInt(fishAgeMap[countdown], 10)
		if(newValue === -1) {
			newValue = daysUntilFisReproduceAgain
			newAgeMap[daysUntilFisReproduceFirstTime] += numberOfFishWithThisCooldown
		}
		newAgeMap[newValue] += numberOfFishWithThisCooldown
	})
	return newAgeMap
}

const getTotalFish = (fishAgeMap) => {
	let total = 0
	Object.keys(fishAgeMap).forEach((countdown) => {
		total += parseInt(fishAgeMap[countdown], 10)
	})
	return total
}

const days = 256
for (let day = 0; day < days; day++) {
	fishAgeMap = tick(fishAgeMap)
}

const result = {
	days,
	fishCount: getTotalFish(fishAgeMap),
}
console.log(JSON.stringify(result, null, '  '))
