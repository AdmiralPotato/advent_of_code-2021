const dataPath = 'input.txt'
let stateGrid = []
let flashGrid = []
let width = 0;
let height = 0;
let stateContext = null
let flashContext = null
let ticks = 0
let flashesThisTick = 0
let flashesTotal = 0

const statusText = document.getElementById('status')

const makeZeroGrid = () => {
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
  fetch(dataPath)
    .then((request) => request.text())
    .then((input) => {
      stateGrid = input
        .trim()
        .split('\n')
        .map((line) => line
          .split('')
          .map((value) => parseInt(value, 10))
        )
      width = stateGrid[0].length
      height = stateGrid.length
      stateContext = prepContextById('state')
      flashContext = prepContextById('flash')
      statusText.innerText = 'loaded'
      flashGrid = makeZeroGrid()
      updateDisplay()
    })
}


const prepContextById = (id) => {
  const canvas = document.getElementById(id)
  canvas.width = width
  canvas.height = height
  return context = canvas.getContext('2d')
}

const colorFlash = (cellValue) => {
  return `hsl(0, 0%, ${100 * (cellValue)}%)`
}

const colorRainbow = (cellValue) => {
  return `hsl(${120 * (cellValue / 9)}, 100%, 50%)`
}

const displayState = (grid, context, colorConvert) => {
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      const cellValue = grid[y][x]
      context.fillStyle = colorConvert(cellValue)
      context.fillRect(x, y, 1, 1)
    })
  })
}

const updateDisplay = () => {
  displayState(stateGrid, stateContext, colorRainbow)
  displayState(flashGrid, flashContext, colorFlash)
  // console.table(stateGrid)
  const output = JSON.stringify({
    flashesThisTick,
    flashesTotal,
    ticks,
    iterationsUntilStable: previousPatterns.length
  }, null, '  ')
  statusText.innerText = output
  console.log(output)
}

const isInBounds = ([x, y]) => {
  return !(
    x < 0
    || x >= width
    || y < 0
    || y >= height
  )
}

const flashAtCell = (grid, x, y) => {
  const cells = [
    [x - 1, y - 1], //nw
    [x - 0, y - 1], //n
    [x + 1, y - 1], //ne
    [x - 1, y - 0], //w
    // [x, y], //center, don't flash, it already did
    [x + 1, y - 0], //e
    [x - 1, y + 1], //sw
    [x - 0, y + 1], //s
    [x + 1, y + 1], //se
  ]
  cells
    .filter(isInBounds) // only cells in bounds
    .forEach(([x, y]) => {
      const cellValue = grid[y][x]
      const newValue = cellValue + 1
      grid[y][x] = newValue
      flashCells(grid, newValue, x, y)
    })
}

const addCells = (grid, cellValue, x, y) => {
  return cellValue + 1
}
const flashCells = (grid, cellValue, x, y) => {
  const currentFlashGridValueAtCell = flashGrid[y][x]
  if (
    cellValue > 9
    && !currentFlashGridValueAtCell
  ) {
    flashGrid[y][x] = 1
    flashAtCell(grid, x, y)
  }
  return cellValue
}
const resetCells = (grid, cellValue, x, y) => {
  return cellValue > 9
    ? 0
    : cellValue
}

const iterateGrid = (grid, iterateFunction) => {
  grid.forEach((row, y) => {
    row.forEach((cellValue, x) => {
      grid[y][x] = iterateFunction(grid, cellValue, x, y)
    })
  })
}

const tick = () => {
  ticks += 1
  flashGrid = makeZeroGrid()
  iterateGrid(stateGrid, addCells)
  iterateGrid(stateGrid, flashCells)
  iterateGrid(stateGrid, resetCells)
  flashesThisTick = 0
  const countFlashesThisTick = (grid, cellValue, x, y) => {
    const value = flashGrid[y][x]
    flashesThisTick += value
    return value
  }
  iterateGrid(flashGrid, countFlashesThisTick)
  flashesTotal += flashesThisTick
  updateDisplay()
  return flashesThisTick
}

const previousPatterns = []
let tickInterval = 0;
const clickHandlerMap = {
  tick,
  tick100() {
    if (tickInterval) {
      clearInterval(tickInterval)
    }
    let i = 0
    tickInterval = setInterval(() => {
      tick()
      i++
      if(i >= 100) {
        clearInterval(tickInterval)
      }
    }, 1000/24)
  },
  tickUntilFull() {
    if (tickInterval) {
      clearInterval(tickInterval)
    }
    tickInterval = setInterval(() => {
      const total = tick()
      const fullCount = width * height
      if(total === fullCount) {
        clearInterval(tickInterval)
      }
    }, 1000/24)
  },
  tickUntilStable() {
    if (tickInterval) {
      clearInterval(tickInterval)
    }
    tickInterval = setInterval(() => {
      tick()
      const pattern = stateGrid.map((line) => line.join('')).join('\n')
      if (
        previousPatterns.length > 0xFFFFFFFF
      ) {
        previousPatterns.shift()
      }
      if(previousPatterns.includes(pattern)) {
        clearInterval(tickInterval)
      }
      previousPatterns.push(pattern)
    }, 1000/24)
  },
  createCustomGrid () {
    width = 50
    height = 50
    stateGrid = makeZeroGrid()
    iterateGrid(stateGrid, () => {
      return Math.floor(Math.random() * 10)
    })
    stateContext = prepContextById('state')
    flashContext = prepContextById('flash')
    statusText.innerText = 'loaded'
    flashGrid = makeZeroGrid()
    updateDisplay()
  },
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