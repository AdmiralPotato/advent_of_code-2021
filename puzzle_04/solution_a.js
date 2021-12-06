const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const segments = fs.readFileSync(dataPath, 'utf-8')
	.trim()
	.split('\n\n')
const sequence = segments.shift().split(',')
const boards = segments.map((segment) => {
	return segment
		.trim()
		.replace(/\s+/g, ' ')
		.split(' ')
})

const winningCombinations = [
	[ 0, 1, 2, 3, 4],
	[ 5, 6, 7, 8, 9],
	[10,11,12,13,14],
	[15,16,17,18,19],
	[20,21,22,23,24],
	[ 0, 5,10,15,20],
	[ 1, 6,11,16,21],
	[ 2, 7,12,17,22],
	[ 3, 8,13,18,23],
	[ 4, 9,14,19,24],
]

const winningNumbers = []

const testBoardForWin = (board, boardIndex) => {
	let result = null
	let winningSet = []
	const winningSetIndex = winningCombinations.findIndex((set) => {
		const numbersOnBoardInSet = set.map((cellIndex) => board[cellIndex])
		const didSetWin = numbersOnBoardInSet.every(
			(cellValue) => winningNumbers.includes(cellValue)
		)
		if (didSetWin) {
			winningSet = numbersOnBoardInSet
		}
		return didSetWin
	})
	if (winningSetIndex !== -1) {
		result = {
			board,
			boardIndex,
			winningSet,
			winningSetIndex
		}
	}
	return result
}

const calculateBoardScore = (winningBoardData) => {
	let result = 0;
	winningBoardData.board.forEach((cellValue) => {
		if (!winningNumbers.includes(cellValue)) {
			result += parseInt(cellValue, 10)
		}
	})
	return result
}


const testAllTheBoards = (boards) => {
	let winningBoard = null
	let winningNumber = -1
	for (let numberIndex = 0; numberIndex < sequence.length; numberIndex++) {
		const number = sequence[numberIndex]
		winningNumbers.push(number)
		for (let boardIndex = 0; boardIndex < boards.length; boardIndex++) {
			winningBoard = testBoardForWin(boards[boardIndex], boardIndex)
			if (winningBoard) {
				winningNumber = parseInt(number, 10)
				const boardScore = calculateBoardScore(winningBoard)
				return {
					winningBoard,
					winningNumber,
					boardScore,
					finalScore: boardScore * winningNumber
				}
			}
		}
	}
	return null
}

const result = testAllTheBoards(boards)
console.log(JSON.stringify(result))
