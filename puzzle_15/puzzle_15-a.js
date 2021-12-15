const dataPath = 'input.txt'
let stateGridSize = {}
let destination = {}
let maxDistance = 0
let stateGrid = []
let pathGrid = []
let pathHistory = ['0,0']
let stateContext = null
let pathContext = null
let currentPosition = {
  x: 0,
  y: 0,
}

const statusText = document.getElementById('status')

const makeZeroGrid = (width, height) => {
  const result = []
  const row = []
  row.length = width
  row.fill(0)
  for (let y = 0; y < height; y++) {
    result[y] = row.slice()
  }
  return result
}

const getData = () => {
  statusText.innerText = 'loading'
  fetch(dataPath)
    .then((request) => request.text())
    .then((input) => {
      statusText.innerText = 'loaded - processing'
      stateGrid = input
        .trim()
        .split('\n')
        .map((line) => line
          .split('')
          .map((value) => parseInt(value, 10))
        )
      init(stateGrid)
    })
}

const init = (stateGrid) => {
  currentPosition = {
    x: 0,
    y: 0,
  }
  pathHistory = ['0,0']
  stateGridSize = getGridSizeFromGrid(stateGrid)
  destination = {
    x: stateGridSize.width - 1,
    y: stateGridSize.height - 1,
  }
  maxDistance = getDistanceFromDestination(0, 0)
  stateContext = prepContextById('state')
  pathContext = prepContextById('path')
  pathGrid = makeZeroGrid(stateGridSize.width, stateGridSize.height)
  updateDisplay()
  // iterateGrid(
  //   pathGrid,
  //   (grid, cellValue, x, y) => ((getDistanceFromDestination(x, y) / maxDistance) * 8) + 1
  // )
  // displayGrid(pathGrid, pathContext, colorRainbow)
}
const prepContextById = (id) => {
  const canvas = document.getElementById(id)
  canvas.width = stateGridSize.width
  canvas.height = stateGridSize.height
  return context = canvas.getContext('2d')
}

const colorFlash = (cellValue) => {
  return `hsl(0, 0%, ${100 * (cellValue / 9)}%)`
}
const colorRainbow = (cellValue) => {
  return cellValue
    ? `hsl(${120 * (cellValue / 9)}, 100%, 50%)`
    : '#000'
}

const displayGrid = (grid, context, colorConvert) => {
  const drawPixel = (grid, cellValue, x, y) => {
    context.fillStyle = colorConvert(cellValue)
    context.fillRect(x, y, 1, 1)
    return cellValue
  }
  iterateGrid(grid, drawPixel)
}

const isInBounds = (x, y) => {
  return !(
    x < 0
    || x >= stateGridSize.width
    || y < 0
    || y >= stateGridSize.height
  )
}

const updateDisplay = () => {
  displayGrid(stateGrid, stateContext, colorFlash)
  displayGrid(pathGrid, pathContext, colorRainbow)
  pathTotalDanger = 0
  const countDots = (grid, cellValue, x, y) => {
    if (cellValue) {
      pathTotalDanger += cellValue
    }
    return cellValue
  }
  iterateGrid(pathGrid, countDots)
  const output = JSON.stringify({
    pathTotalDanger,
    currentPosition,
    pathHistory,
    width: stateGridSize.width,
    height: stateGridSize.height,
  }, null, '  ')
  statusText.innerText = output
  console.log(output)
}

const iterateGrid = (grid, iterateFunction) => {
  grid.forEach((row, y) => {
    row.forEach((cellValue, x) => {
      grid[y][x] = iterateFunction(grid, cellValue, x, y)
    })
  })
}

const getGridSizeFromGrid = (grid) => {
  return {
    width: grid[0].length,
    height: grid.length,
  }
}

const endReached = ({x, y}) => (
  x === destination.x
  && y === destination.y
)

const getDistanceFromDestination = (x, y) => {
  return Math.sqrt(
    ((destination.x - x) ** 2) +
    ((destination.y - y) ** 2)
  )
}

const pickNextCoordinate = ({x, y}) => {
  // let nextX = x + 1
  // let nextY = y
  // if(!isInBounds(nextX, y)) {
  //   nextX = x
  //   nextY =  y + 1
  // }
  const neighbors = [
    {x: x + 0, y: y - 1}, //n
    {x: x + 0, y: y + 1}, //s
    {x: x + 1, y: y + 0}, //e
    {x: x - 1, y: y + 0}, //w
  ].filter(({x, y}) => {
    const positionLabel = `${x},${y}`
    const visitedAlready = pathHistory.includes(positionLabel)
    return !visitedAlready && isInBounds(x, y)
  })
  const neighborScores = neighbors.map(({x, y}, index) => ({
    index,
    score: stateGrid[y][x] + ((getDistanceFromDestination(x, y) / maxDistance) * 9)
  }))
  neighborScores.sort((a, b) => a.score - b.score)
  const smallestNeighbor = neighbors[neighborScores[0].index]
  const positionLabel = `${smallestNeighbor.x},${smallestNeighbor.y}`
  pathHistory.push(positionLabel)
  return smallestNeighbor
}
const tick = () => {
  // let result = endReached(currentPosition)
  // if (result) {
  //   clickHandlerMap.reset()// we were already in a winning state. Reset.
  // } else {
  //   currentPosition = pickNextCoordinate(currentPosition)
  //   result = endReached(currentPosition)
  //   const {x, y} = currentPosition
  //   pathGrid[y][x] = stateGrid[y][x]
  //   updateDisplay()
  // }
  // screw it, gonna try with astar algorithm from someone else's library.
  const graph = new Graph(stateGrid)
  const start = graph.grid[0][0];
  const end = graph.grid[stateGridSize.width - 1][stateGridSize.height - 1];
  const star = astar.search(graph, start, end);
  let total = 0
  star.forEach((node) => {
    const [x, y] = [node.y, node.x] // yes, flip them. this astar graph is backward.
    pathHistory.push(`${x},${y}`)
    const cellValue = stateGrid[y][x]
    pathGrid[y][x] = cellValue
    total += cellValue
  })
  updateDisplay()
  return true
}

let tickInterval = 0;
const clickHandlerMap = {
  tick,
  tickAll() {
    const complete = tick()
    if (complete) {
      clickHandlerMap.reset()
    }
    if (tickInterval) {
      clearInterval(tickInterval)
    }
    tickInterval = setInterval(() => {
      const complete = tick()
      if(complete) {
        clearInterval(tickInterval)
      }
    }, 1000/24)
  },
  reset () {
    if (tickInterval) {
      clearInterval(tickInterval)
    }
    init(stateGrid)
  }
}

document.body.addEventListener('click', (event) => {
  const target = event.target
  const handlerName = target.dataset.handler
  const handler = clickHandlerMap[handlerName]
  if (handler) {
    handler(event)
  }
})
getData()
