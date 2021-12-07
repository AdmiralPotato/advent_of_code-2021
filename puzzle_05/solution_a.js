const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const pairs = fs.readFileSync(dataPath, 'utf-8')
	.trim()
	.split('\n')
	.map((line) => line
			.replace(' -> ', ',')
			.split(',')
			.map((string) => parseInt(string, 10))
	)

const getArrayFullOfZeros = (length) => {
	let result = []
	result.length = length
	result.fill(0)
	return result
}

let xMax = 0
let yMax = 0
pairs.forEach((pair) => {
	xMax = Math.max(xMax, pair[0], pair[2])
	yMax = Math.max(yMax, pair[1], pair[3])
})

const makeGrid = (width, height) => {
	const grid = []
	for (let i = 0; i < height + 1; i++) {
		grid[i] = getArrayFullOfZeros(width + 1)
	}
	return grid
}

// reference: https://en.wikipedia.org/wiki/Digital_differential_analyzer_(graphics_algorithm)
const drawLineOnGrid = (grid, pair) => {
	const [x1,y1,x2,y2] = pair
	let dx = (x2 - x1);
	let dy = (y2 - y1);
	if (dx && dy) {
		return // draw only horiz or vert lines for now
	}
	const dxAbs = Math.abs(dx)
	const dyAbs = Math.abs(dy)
	let step = dxAbs >= dyAbs
		? dxAbs
		: dyAbs
	dx = dx / step;
	dy = dy / step;
	let x = x1;
	let y = y1;
	let i = 1;
	while (i <= step + 1) {
		grid[y][x] += 1;
		x = x + dx;
		y = y + dy;
		i = i + 1;
	}
}

const logGrid = (grid) => {
	return grid.map(
		(row) => (row
			.join('')
			.replace(/0/g,'.'))
	).join('\n')
}

const getDangerZonesFromGrid = (grid) => {
	const flatGrid = Array.prototype.concat.apply([], grid)
	const dangerZones = flatGrid.filter((value) => value > 1)
	return dangerZones.length
}

const stateGrid = makeGrid(xMax, yMax)

pairs.forEach((pair) => {
	drawLineOnGrid(stateGrid, pair)
})

const gridLog = logGrid(stateGrid)
const result = {
	xMax,
	yMax,
	dangerZones: getDangerZonesFromGrid(stateGrid)
}

console.log(JSON.stringify(result, null, '  '))
// console.log(gridLog)
