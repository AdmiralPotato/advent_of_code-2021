const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const pairs = fs.readFileSync(dataPath, 'utf-8')
  .trim()
  .split('\n')
  .map((line) => line.split('-'))

const makeGraph = (pairs) => {
  const result = {}
  pairs.forEach(([a, b]) => {
    const valueA = (result[a] || [])
    const valueB = (result[b] || [])
    valueA.push(b)
    valueB.push(a)
    result[a] = valueA
    result[b] = valueB
  })
  return result
}

const graph = makeGraph(pairs)
const hasBeenToAnotherSmallCaveTwice = (segments) => {
  const totals = {}
  segments.forEach((segment) => {
    if (isSmall(segment)) { // only total smalls, bigs we can revisit infinitely
      totals[segment] = (totals[segment] || 0) + 1
    }
  })
  return Math.max(
    ...Object.values(totals)
  ) > 1
}
const isSmall = (s) => s === s.toLowerCase()
const shouldIGoThere = (segments, nextSegment) => {
  const isCaveSmall = isSmall(nextSegment)
  const haveWeAlreadyBeenThere = segments.includes(nextSegment)
  const hasAlreadyTakenDetour = hasBeenToAnotherSmallCaveTwice(segments)
  const stopBecauseWeHaveAlreadyVisitedStart = (
    haveWeAlreadyBeenThere
    && nextSegment === 'start'
  )
  const canWeTakeADetour = !(
    isCaveSmall
    && haveWeAlreadyBeenThere
    && hasAlreadyTakenDetour
  )
  return (
    !stopBecauseWeHaveAlreadyVisitedStart
    && canWeTakeADetour
  )
}
const crawlPath = (
  graph,
  combinations,
  segments,
  nextSegment
) => {
  if (nextSegment === 'end') {
    segments.push(nextSegment)
    combinations.push(segments)
  } else if (shouldIGoThere(segments, nextSegment)) {
    segments.push(nextSegment)
    graph[nextSegment].forEach((key) => {
      const newSegments = segments.slice()
      crawlPath(
        graph,
        combinations,
        newSegments,
        key
      )
    })
  }
}

const combinations = []
crawlPath(
  graph,
  combinations,
  [],
  'start'
)
console.log(JSON.stringify(
  graph,
  null,
  '  '
))
console.log(
  combinations
    .map((item) => item.join(','))
    .sort()
    .join('\n')
)
console.log(JSON.stringify(
  {
    combinationCount: combinations.length
  },
  null,
  '  '
))
