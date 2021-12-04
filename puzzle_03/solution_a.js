const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const lines = fs.readFileSync(dataPath, 'utf-8')
	.trim()
	.split('\n')

const columnCount = lines[0].length
const getArrayFullOfZeros = (length) => {
	let result = []
	result.length = length
	result.fill(0)
	return result
}
const getCounts = (lines) => {
	const one = getArrayFullOfZeros(columnCount)
	const zero = one.slice()
	lines.forEach((line) => {
		const bits = line.split('')
		bits.forEach((bit, bitIndex) => {
			if(bit === '1') {
				one[bitIndex] += 1
			} else {
				zero[bitIndex] += 1
			}
		})
	});
	return {
		count: lines.length,
		one,
		zero
	}
}

const getTypeDominance = (counts) => {
	const a = 'one'
	const b = 'zero'
	const result = {
		[a]: getArrayFullOfZeros(columnCount),
		[b]: getArrayFullOfZeros(columnCount),
	}
	counts[a].forEach((valueA, columnIndex) => {
		const valueB = counts[b][columnIndex]
		// add bool to number results in number + 0 or 1
		result[a][columnIndex] += valueA >= valueB
		result[b][columnIndex] += valueB >= valueA
	})
	return result
}

const counts = getCounts(lines)
const typeDominance = getTypeDominance(counts)
console.log(JSON.stringify(counts))
console.log(JSON.stringify(typeDominance))

const gammaRate = parseInt(typeDominance.one.join(''), 2)
const epsilonRate = parseInt(typeDominance.zero.join(''), 2)
console.log({
	gammaRate,
	epsilonRate,
	result: gammaRate * epsilonRate
})
