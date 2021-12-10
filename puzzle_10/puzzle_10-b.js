const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const lines = fs.readFileSync(dataPath, 'utf-8')
  .trim()
  .split('\n')

const openingChars = '([{<'
const closingChars = ')]}>'

const errorScores = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
}

const autoCompleteScores = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
}

const getAutoCompleteScoreForResult = (result, openPairs) => {
  result.autocomplete = result.openPairs
  let score = 0;
  while (openPairs.length) {
    const openChar = openPairs.pop()
    const closingChar = closingChars[
      openingChars.indexOf(openChar)
    ]
    const scoreForClosingChar = autoCompleteScores[closingChar]
    score *= 5
    score += scoreForClosingChar
    result.autocomplete += closingChar
  }
  result.autocompleteScore = score
}

const processLine = (line) => {
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
        result.errorScore = errorScores[char]
        return result
      }
    }
  }
  result.openPairs = openPairs.join('')
  result.status = openPairs.length
    ? 'incomplete'
    : 'valid'
  if (openPairs.length) {
    getAutoCompleteScoreForResult(result, openPairs)
  }
  return result
}


const results = lines
  .map(processLine)


const sortNumber = (a, b) => a - b

let totalErrorScore = 0
const errorsSimplified = results
  .filter((item) => item.status === 'invalid')
  .map((item) => {
    const score = item.errorScore
    totalErrorScore += score
    return score
  })
const autocompleteSimplified = results
  .filter((item) => item.status === 'incomplete')
  .map((item) => {
    return item.autocompleteScore
  })
  .sort(sortNumber)

const autoLength = autocompleteSimplified.length
const middle = Math.floor(autoLength / 2)

console.log(JSON.stringify(results, null, '  '))

console.log(JSON.stringify({
  // errorsSimplified,
  // totalErrorScore,
  autocompleteSimplified,
  autoLength,
  middle: autocompleteSimplified[middle]
}, null, '  '))
