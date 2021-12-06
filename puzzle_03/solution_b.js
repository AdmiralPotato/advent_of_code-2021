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

const getMostFrequentValueAtColumn = (counts, columnIndex) => {
	const a = counts.one[columnIndex]
	const b = counts.zero[columnIndex]
	return a >= b
		? '1'
		: '0'
}
const getLeastFrequentValueAtColumn = (counts, columnIndex) => {
	const a = counts.one[columnIndex]
	const b = counts.zero[columnIndex]
	return b <= a
		? '0'
		: '1'
}

const searchForResultOfType = (inputLines, getDesiredValueAtColumn) => {
	let lines = inputLines.slice()
	for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
		const counts = getCounts(lines)
		const desiredColumnValue = getDesiredValueAtColumn(counts, columnIndex)
		const filterByColumn = (line) => line[columnIndex] === desiredColumnValue
		lines = lines.filter(filterByColumn)
		if (lines.length === 1) {
			return lines[0]
		}
	}
	return 'something probably went wrong'
}

const oxygenGeneratorResult = searchForResultOfType(lines, getMostFrequentValueAtColumn)
const co2ScrubberResult = searchForResultOfType(lines, getLeastFrequentValueAtColumn)
const oxygenGeneratorRating = parseInt(oxygenGeneratorResult, 2)
const co2ScrubberRating = parseInt(co2ScrubberResult, 2)

console.log(JSON.stringify({
	oxygenGeneratorResult,
	co2ScrubberResult,
	oxygenGeneratorRating,
	co2ScrubberRating,
	result: oxygenGeneratorRating * co2ScrubberRating
}, null, '\t'))
