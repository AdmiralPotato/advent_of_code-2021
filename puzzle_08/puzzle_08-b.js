const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const lines = fs.readFileSync(dataPath, 'utf-8')
  .trim()
  .split('\n')

const lengthBasedClassifiers = {
  2: [1],
  3: [7],
  4: [4],
  5: [2, 3, 5],
  6: [0, 6, 9],
  7: [8],
}

const arrayOfLetterPositions = [
  'abcefg', // 0
  'cf',     // 1
  'acdeg',  // 2
  'acdfg',  // 3
  'bcdf',   // 4
  'abdfg',  // 5
  'abdefg', // 6
  'acf',    // 7
  'abcdefg',// 8
  'abcdfg',  // 9
]

const createLengthFilter = (length) => {
  return (item) => {
    return item.length === length
  }
}

const includesAllChars = (possibilities, requiredString, inverse) => {
  const required = requiredString.split('')
  return possibilities.filter((string) => {
    const result = required.every(
      (letter) => string.includes(letter)
    )
    return inverse ? !result : result
  })
}

const intersectSets = (possibilities, required, inverse) => {
  return possibilities.filter((string) => {
    const result = required.includes(string);
    return inverse ? !result : result
  })
}

const maskChars = (aString, bString, invert) => {
  const a = aString.split('')
  const b = bString.split('')
  return intersectSets(a, b, invert).join('')
}

const groupCombinationsByLengths = (combinations) => {
  const lengthGroups = {}
  Object.entries(lengthBasedClassifiers).forEach(([
    segmentLength,
    possibleDigits
  ]) => {
    const segmentsWithThisLength = combinations.filter(
      createLengthFilter(parseInt(segmentLength, 10))
    )
    lengthGroups[segmentLength] = segmentsWithThisLength
  })
  const characters = {}
  characters[1] = lengthGroups[2][0];
  characters[4] = lengthGroups[4][0];
  characters[7] = lengthGroups[3][0];
  characters[8] = lengthGroups[7][0];
  characters[6] = includesAllChars(
    lengthGroups[6],
    characters[7],
    true
  )[0];
  characters[9] = includesAllChars(
    lengthGroups[6],
    characters[4]
  )[0];
  characters[0] = intersectSets(
    lengthGroups[6],
    [
      characters[6],
      characters[9]
    ],
    true
  )[0];
  characters[5] = maskChars(
    characters[6],
    characters[9],
  );
  characters[3] = includesAllChars(
    lengthGroups[5],
    characters[1],
    false
  )[0];
  characters[2] = intersectSets(
    lengthGroups[5],
    [
      characters[5],
      characters[3],
    ],
    true
  )[0];
  // Do I need this? maybe next segment.
  // const segmentMap = {}
  // segmentMap.e = maskChars(
  //   characters[0],
  //   characters[9],
  //   true
  // )
  // segmentMap.a = maskChars(
  //   characters[7],
  //   characters[1],
  //   true
  // )
  const combinationMap = {}
  Object.entries(characters).forEach(([
    digit,
    combination,
  ]) => {
    combinationMap[combination] = digit
  })
  return {
    characters,
    lengthGroups,
    combinationMap,
  }
}

const combinationLookup = (values, lookup) => {
  return values.map((key) => lookup[key])
}

const splitAndSortChars = (segment) => {
  return segment.split('').sort().join('')
}
const sortByLength = (a, b) => {
  return a.length - b.length
}

const parsedData = lines
  .map((line) => {
    const [
      combinationsString,
      valueString,
    ] = line.split(' | ')
    const combinations = combinationsString
      .split(' ')
      .map(splitAndSortChars)
      .sort(sortByLength)
    const value = valueString
      .split(' ')
      .map(splitAndSortChars)
    const classified = groupCombinationsByLengths(combinations)
    return {
      combinations,
      classified,
      value,
      result: combinationLookup(
        value,
        classified.combinationMap
      ).join('')
    }
  })

let total = 0
parsedData.forEach((parsed) => {
  total += parseInt(parsed.result, 10)
})

console.log(JSON.stringify(
  total,
  null,
  '  '
));
