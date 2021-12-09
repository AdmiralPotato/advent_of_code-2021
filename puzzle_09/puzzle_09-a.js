const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const grid = fs.readFileSync(dataPath, 'utf-8')
  .trim()
  .split('\n')
  .map((line) => line
    .split('')
    .map((value) => parseInt(value, 10))
  )

const getRiskLevelAtCell = (x, y) => {
  const center = grid[y][x]
  const neighbors = {
    center,
    n: (grid[y - 1] || [])[x],
    s: (grid[y + 1] || [])[x],
    e: grid[y][x + 1],
    w: grid[y][x - 1],
  }
  const testableValues = Object.values(neighbors).filter((value) => value !== undefined)
  const min = Math.min(...testableValues)
  return (
    (min === center)
    && (min !== 9) // handle plateau of 9s
  )
    ? center + 1
    : 0
}

let total = 0
const riskGrid = grid.map((row, y) => {
  const result =  row.map(
    (cell, x) => {
      const riskLevel = getRiskLevelAtCell(x, y)
      total += riskLevel
      return ('' + riskLevel)
        .replace('10', 'A') // probably got problems if 9 is your low point
    }
  )
  return result.join('')
})
console.log(riskGrid.join('\n'))
console.log('riskTotal:' + total)
