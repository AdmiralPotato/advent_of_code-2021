const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const [polymerTemplate, linesString] = fs.readFileSync(dataPath, 'utf-8')
  .trim()
  .split('\n\n')


const pairs = {}
linesString
  .trim()
  .split('\n')
  .forEach((line) => {
    const [pair, insertion] = line.split(' -> ')
    pairs[pair] = insertion
  })

const tick = (polymerTemplate) => {
  let result = polymerTemplate.split('')
  for (let i = 0; i < result.length - 1; i += 1) {
    const pair = result[i] + result[i + 1]
    const insertion = pairs[pair]
    if (insertion) {
      result.splice(i + 1, 0, insertion)
      i += 1
    }
  }
  return result.join('')
}

const numericSort = (a, b) => a - b

const countElements = (string) => {
  const letters = string.split('')
  const countMap = {}
  letters.forEach((a) => {
    countMap[a] = (countMap[a] || 0) + 1
  })
  const counts = Object.values(countMap)
    .sort(numericSort)

  const min = counts[0]
  const max = counts.slice(-1)[0]
  return {
    min,
    max,
    diff: max - min,
    countMap,
  }
}

let processed = polymerTemplate
const stages = [processed]
for (let i = 0; i < 10; i++) {
  processed = tick(processed)
  stages.push(processed)
}

const counteces = countElements(processed)

console.log({
  polymerTemplate,
  pairs,
  stages,
  counteces,
})
