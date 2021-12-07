const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const crabPositions = fs.readFileSync(dataPath, 'utf-8')
  .trim()
  .split(',')
  .map((string) => parseInt(string, 10))

const xMax = Math.max(...crabPositions)

const getFuelCostAtPosition = (position) => {
  let total = 0;
  crabPositions.forEach((x) => {
    const diff = Math.abs(x - position)
    for (let i = 0; i < diff; i++) {
      total += i + 1
    }
  })
  return total;
}

const results = []
for (let i = 0; i <= xMax; i++) {
  results.push(
    getFuelCostAtPosition(i)
  )
}

const smallest = Math.min(...results)

console.log(smallest)
