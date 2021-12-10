const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const lines = fs.readFileSync(dataPath, 'utf-8')
  .trim()
  .split('\n')

const openingChars = '([{<'
const closingChars = ')]}>'

const testLine = (line) => {
  const openPairs = []
  const result = {
    status: 'unknown',
    line,
  }
  const instructions = line.split('')
  while(instructions.length) {
    const char = instructions.shift()
    if (openingChars.includes(char)) {
      openPairs.push(char)
    } else if (closingChars.includes(char)) {
      const lastOpeningChar = openPairs.pop()
      const validClosingChar = closingChars[
        openingChars.indexOf(lastOpeningChar)
      ]
      if (char !== validClosingChar) {
        // put it back so we see where it failed
        openPairs.push(lastOpeningChar)
        result.status = 'invalid'
        result.badChar = char
        result.openPairs = openPairs.join('')
        return result
      }
    }
  }
  result.status = openPairs.length
    ? 'incomplete'
    : 'valid'
  result.openPairs = openPairs.join('')
  return result
}


const results = lines
  .map(testLine)

const errorScores = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
}

let totalErrorScore = 0
const errorsSimplified = results
  .filter((item) => item.status === 'invalid')
  .map((item) => {
    const error = item.badChar
    const errorScore = errorScores[error]
    totalErrorScore += errorScore
    return error
  })

console.log(JSON.stringify(results, null, '  '))

console.log(JSON.stringify({
  errorsSimplified,
  totalErrorScore,
}, null, '  '))
