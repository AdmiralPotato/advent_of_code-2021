const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
// const dataPath = path.join(__dirname , 'input.txt')
const [dirtyInstructions, startImageDataString] = fs.readFileSync(dataPath, 'utf-8')
  .trim()
  .split('\n\n')
  .map((segment) => segment.trim())

const instructions = dirtyInstructions.replace(/(\r|\n)/g,'')
const startImageData = startImageDataString
  .split('\n')
  .map((line) => line.trim().split(''))

const growImageData = (imageData, steps) => {
  const sizeOfNewCells = steps
  const width = imageData[0].length + (2 * sizeOfNewCells)
  const completelyEmptyRow = []
  completelyEmptyRow.length = width
  completelyEmptyRow.fill('.')
  const emptyRowString = completelyEmptyRow.join('')
  const rowEnds = []
  rowEnds.length = sizeOfNewCells
  rowEnds.fill('.')
  const imageDataWithExtraColumns = imageData.map((row) => [
    ...rowEnds,
    ...row,
    ...rowEnds,
  ])
  const topAndBottom = []
  topAndBottom.length = sizeOfNewCells
  topAndBottom.fill(emptyRowString)
  return [
    ...topAndBottom.map((line) => line.split('')),
    ...imageDataWithExtraColumns,
    ...topAndBottom.map((line) => line.split('')),
  ]
}

const getPixelValue = (x, y, imageData, step) => {
  // this is a terrible stupid gotcha and the puzzle designer should feel bad
  const voidColor = step % 2 ? '#' : '.'
  const surrounding = [
    (imageData[y - 1] || [])[x - 1] || voidColor,
    (imageData[y - 1] || [])[x - 0] || voidColor,
    (imageData[y - 1] || [])[x + 1] || voidColor,
    (imageData[y - 0] || [])[x - 1] || voidColor,
    (imageData[y - 0] || [])[x - 0] || voidColor,
    (imageData[y - 0] || [])[x + 1] || voidColor,
    (imageData[y + 1] || [])[x - 1] || voidColor,
    (imageData[y + 1] || [])[x - 0] || voidColor,
    (imageData[y + 1] || [])[x + 1] || voidColor,
  ]
    .join('')
    .replace(/\./g, '0')
    .replace(/#/g, '1')
  return parseInt(surrounding, 2)
}

const testingPixelValue = getPixelValue(2, 2, startImageData)

console.log(`testingPixelValue: ${testingPixelValue}`)

const deepClone = (value) => JSON.parse(JSON.stringify(value))

const enhance = (imageData, step) => {
  const enhanced = deepClone(imageData)
  const readOnly = deepClone(enhanced)
  for (let y = 0; y < enhanced.length; y++) {
    for (let x = 0; x < enhanced[0].length; x++) {
      const instructionId = getPixelValue(x, y, readOnly, step)
      enhanced[y][x] = instructions[instructionId]
    }
  }
  return enhanced
}

const logImageData = (imageData) => {
  return imageData.map(row => row.join('')).join('\n')
}

console.log('before:\n' + logImageData(startImageData));

const steps = 2
let imageData = growImageData(startImageData, steps)
for (let i = 0; i < steps; i++) {
  imageData = enhance(imageData, i)
  console.log(`Step: ${i}\n` + logImageData(imageData));
}

const getTotalLitPixels = (imageData) => {
  const string = logImageData(imageData)
    .replace(/\n/g, '')
    .replace(/\./g, '')
    .trim()
  return string.length
}

const totalLitPixels = getTotalLitPixels(imageData)

// too high: 5278
// too high: 5114
console.log(`totalLitPixels: ${totalLitPixels}`)
