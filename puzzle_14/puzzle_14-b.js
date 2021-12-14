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

const makePairsFromFirstPolymerTemplate = (input) => {
  const result = {}
  for (let i = 0; i < input.length - 1; i += 1) {
    const pair = input[i] + input[i + 1]
    result[pair] = (result[pair] || 0) + 1
  }
  return result
}
const deepClone = (value) => JSON.parse(JSON.stringify(value))

const tick = (pairCountMap) => {
  const inputPairs = deepClone(pairCountMap)
  const newPairs = {}
  // count new ones
  Object.keys(inputPairs).forEach((pair) => {
    const insertion = pairs[pair]
    if (insertion) {
      const currentCount = inputPairs[pair]
      inputPairs[pair] = 0
      const a = pair[0] + insertion
      const b = insertion + pair[1]
      newPairs[a] = (newPairs[a] || 0) + currentCount
      newPairs[b] = (newPairs[b] || 0) + currentCount
    }
  })
  // Object.keys(inputPairs).forEach((pair) => {
  //   newPairs[pair] = (newPairs[pair] || 0) + inputPairs[pair]
  // })
  return newPairs
}

const numericSort = (a, b) => a - b

const countElements = (polymerTemplate, pairCountMap) => {
  const letterMap = {}
  Object.entries(pairCountMap).forEach(([pair, count]) => {
    const a = pair[0]
    const b = pair[0]
    letterMap[a] = (letterMap[a] || 0) + count
    letterMap[b] = (letterMap[b] || 0) + count
  })
  letterMap[polymerTemplate[0]] += 2
  letterMap[polymerTemplate.slice(-1)[0]] += 2
  const counts = Object.values(letterMap)
    .map((n) => n / 2)
    .sort(numericSort)

  const min = counts[0]
  const max = counts.slice(-1)[0]
  return {
    min,
    max,
    diff: max - min,
    countMap: letterMap,
  }
}

let processed = makePairsFromFirstPolymerTemplate(polymerTemplate)
const stages = [processed]
console.log(`${-1}:\n    ${JSON.stringify(processed)}`)
for (let i = 0; i < 40; i++) {
  processed = tick(processed)
  console.log(`${i}:\n    ${JSON.stringify(processed)}`)
  stages.push(processed)
}

const counteces = countElements(polymerTemplate, processed)

console.log(JSON.stringify({
  polymerTemplate,
  pairs,
  // stages,
  counteces,
}, null, '  '))
