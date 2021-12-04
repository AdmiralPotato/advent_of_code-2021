const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'data-sample.txt')
const depths = fs.readFileSync(dataPath, 'utf-8')
	.trim()
	.split('\n')
	.map((line) => parseInt(line, 10))

let increaseCount = 0
let a = depths.shift()
let b = depths.shift()
let c = depths.shift()
let last = (a + b + c)
depths.forEach((d) => {
	let current = (b + c + d)
	if (current > last) {
		increaseCount += 1
	}
	a = b
	b = c
	c = d
	last = current
})

console.log(increaseCount)
