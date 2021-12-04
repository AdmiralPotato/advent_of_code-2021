const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const lines = fs.readFileSync(dataPath, 'utf-8')
	.trim()
	.split('\n')

let x = 0
let y = 0

const directionMap = {
	up (amount) { y -= amount },
	down (amount) { y += amount },
	forward (amount) { x += amount },
}

lines.forEach((line) => {
	const [direction, amountString] = line.split(' ')
	const amount = parseInt(amountString, 10)
	const directionHandler = directionMap[direction]
	if (directionHandler) {
		directionHandler(amount)
	} else {
		throw new Error(`Invalid direction: ${direction}`)
	}
})

console.log(x * y)
