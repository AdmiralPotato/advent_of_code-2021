const fs = require('fs')
const dataPath = process.stdin.fd
const depths = fs.readFileSync(dataPath, 'utf-8')
	.trim()
	.split('\n')
	.map((line) => parseInt(line, 10))

let increaseCount = 0
let last = depths.shift()
depths.forEach((current) => {
	if (current > last) {
		increaseCount += 1
	}
	last = current
})

console.log(increaseCount)
