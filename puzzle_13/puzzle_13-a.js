const dataPath = 'input.txt'
let stateGrid = []
let dots = []
let folds = []
let lastFold = null
let stateContext = null
let foldIndex = -1
let dotsThisTick = 0

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

const foldRegex = /fold along (\S)=(.+)/
const getData = () => {
  fetch(dataPath)
    .then((request) => request.text())
    .then((input) => {
      statusText.innerText = 'loaded - processing'
      const [
        dotStrings,
        foldStrings
      ] = input.trim().split('\n\n')
      dots = dotStrings
        .trim()
        .split('\n')
        .map((line) => line
          .split(',')
          .map((value) => parseInt(value, 10))
        )
      folds = foldStrings
        .trim()
        .split('\n')
        .map((string) => {
          const match = string.match(foldRegex)
          return {
            axis: match[1],
            offset: parseInt(match[2], 10),
          }
        })
      init(dots, folds)
    })
}

const init = (dots, folds) => {
  const gridSize = getGridSizeFromDots(dots)
  foldIndex = -1
  lastFold = null
  stateContext = prepContextById('state')
  stateGrid = makeZeroGrid(gridSize.width, gridSize.height)
  populateGridFromDots(stateGrid, dots)
  updateDisplay()
}
const prepContextById = (id) => {
  const canvas = document.getElementById(id)
  return context = canvas.getContext('2d')
}

const colorFlash = (cellValue) => {
  return `hsl(0, 0%, ${100 * (cellValue)}%)`
}

const displayGrid = (grid, context, colorConvert) => {
  const gridSize = getGridSizeFromGrid(grid)
  context.canvas.width = gridSize.width
  context.canvas.height = gridSize.height
  const drawPixel = (grid, cellValue, x, y) => {
    context.fillStyle = colorConvert(cellValue)
    context.fillRect(x, y, 1, 1)
    return cellValue
  }
  iterateGrid(stateGrid, drawPixel)
}

const updateDisplay = () => {
  displayGrid(stateGrid, stateContext, colorFlash)
  // console.table(stateGrid)
  const gridSize = getGridSizeFromGrid(stateGrid)
  dotsThisTick = 0
  const countDots = (grid, cellValue, x, y) => {
    if (cellValue) {
      dotsThisTick += 1
    }
    return cellValue
  }
  iterateGrid(stateGrid, countDots)
  const output = JSON.stringify({
    dotsThisTick,
    foldIndex,
    lastFold,
    width: gridSize.width,
    height: gridSize.height,
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

const deepClone = (value) => JSON.parse(JSON.stringify(value))

const foldAxes = {
  x(grid, x) {
    const a = grid.map((row) => row.slice(0, x))
    const b = grid.map((row) => row.slice(x + 1))
    const smaller = a[0].length <= b[0].length ? a : b
    const larger = a[0].length > b[0].length ? a : b
    const widthDifference = larger[0].length - smaller[0].length
    larger.forEach((row) => row.reverse())
    iterateGrid(larger, (grid, cellValue, x, y) => {
      let value = cellValue
      const smallerColumnIndex = x - widthDifference
      if (smallerColumnIndex >= 0) {
        value += smaller[y][smallerColumnIndex]
      }
      return value
    })
    return larger
  },
  y(grid, y) {
    const a = grid.slice(0, y)
    const b = grid.slice(y + 1)
    const smaller = a.length <= b.length ? a : b
    const larger = a.length > b.length ? a : b
    const heightDifference = larger.length - smaller.length
    larger.reverse()
    iterateGrid(larger, (grid, cellValue, x, y) => {
      let value = cellValue
      const smallerRowIndex = y - heightDifference
      if (smallerRowIndex >= 0) {
        value += smaller[smallerRowIndex][x]
      }
      return value
    })
    return larger
  },
}

const getGridSizeFromDots = (dots) => {
  const x = []
  const y = []
  dots.forEach((dot) => {
    x.push(dot[0])
    y.push(dot[1])
  })
  return {
    width: Math.max(...x) + 1,
    height: Math.max(...y) + 1,
  }
}
const getGridSizeFromGrid = (grid) => {
  return {
    width: grid[0].length,
    height: grid.length,
  }
}
const populateGridFromDots = (grid, dots) => {
  dots.forEach(([x, y]) => (grid[y][x] = 1))
}

const endReached = () => (foldIndex >= folds.length - 1)

const tick = () => {
  if (endReached()) {
    return // don't
  }
  foldIndex += 1
  lastFold = folds[foldIndex]
  const foldAxisFunction = foldAxes[lastFold.axis]
  if (!foldAxisFunction) {
    throw new Error(`Invalid fold axis:`, lastFold.axis)
  }
  stateGrid = foldAxisFunction(stateGrid, lastFold.offset)
  updateDisplay()
  return dotsThisTick
}

let tickInterval = 0;
const clickHandlerMap = {
  tick,
  tickAll() {
    if (endReached()) {
      clickHandlerMap.reset()
    }
    if (tickInterval) {
      clearInterval(tickInterval)
    }
    tickInterval = setInterval(() => {
      tick()
      if(endReached()) {
        clearInterval(tickInterval)
      }
    }, 1000/24)
  },
  reset () {
    if (tickInterval) {
      clearInterval(tickInterval)
    }
    init(dots, folds)
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