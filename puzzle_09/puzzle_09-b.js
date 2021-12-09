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

const width = grid[0].length
const height = grid.length
const basinIdGrid = grid.map(() => {
  const result = []
  result.length = width
  return result
})

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

const isOufOfBounds = (x, y) => {
  return (
    x < 0
    || x >= width
    || y < 0
    || y >= height
  )
}

const fillBasin = (x, y, basinId) => {
  let totalSize = 0
  if (!isOufOfBounds(x, y)) {
    const value = grid[y][x]
    const cellBasinIndex = basinIdGrid[y][x]
    if (
      value < 9
      && cellBasinIndex === undefined
    ) {
      basinIdGrid[y][x] = basinId
      totalSize += 1
      totalSize += fillBasin(x, y - 1, basinId)
      totalSize += fillBasin(x, y + 1, basinId)
      totalSize += fillBasin(x + 1, y, basinId)
      totalSize += fillBasin(x - 1, y, basinId)
    }
  }
  return totalSize
}

let total = 0
const basins = []
const riskGrid = grid.map((row, y) => {
  const result =  row.map(
    (cell, x) => {
      const riskLevel = getRiskLevelAtCell(x, y)
      if (riskLevel) {
        basins.push({
          x,
          y,
          riskLevel,
          basinSize: fillBasin(x, y, basins.length)
        })
      }
      total += riskLevel
      return ('' + riskLevel)
        .replace('10', 'A') // probably got problems if 9 is your low point
    }
  )
  return result.join('')
})
console.log(riskGrid.join('\n'))
console.log('riskTotal:' + total)
console.log(JSON.stringify(basins, null, '  '))

const sortNumber = (a, b) => a - b
const basinSizes = basins.map((basin) => basin.basinSize).sort(sortNumber).reverse()

console.log(JSON.stringify(basinSizes))

console.log('result: ' + (
  basinSizes[0]
  * basinSizes[1]
  * basinSizes[2]
))
