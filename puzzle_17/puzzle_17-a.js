const dataPath = 'input.txt'
const statusGrid = document.getElementById('grid')
const statusText = document.getElementById('state')
const numberInput = document.getElementById('number')
let targetZone = {}
const getData = () => {
  statusText.innerText = 'loading'
  fetch(dataPath)
    .then((request) => request.text())
    .then((input) => {
      statusText.innerText = 'loaded - processing'
      const segments = input
        .trim()
        .split(/(x=|y=)/)

      const targetZoneArray = [
        segments[2],
        segments[4]
      ]
        .map((segment) => segment
          .replace(',', '')
          .split('..')
          .map((string) => parseInt(string, 10))
        )
      targetZone = {
        xMin: Math.min(...targetZoneArray[0]),
        xMax: Math.max(...targetZoneArray[0]),
        yMin: Math.min(...targetZoneArray[1]),
        yMax: Math.max(...targetZoneArray[1]),
      }
      numberInput.value = Math.abs(targetZone.yMin) - 1 // solution for part A is already in the data
      init()
    })
}

getData()


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

const makeGridWithTargetZone = (targetZone) => {
  const shipPosition = {
    x: 0,
    y: 0,
  }
  const absoluteBox = {
    xMin: Math.min(shipPosition.x, targetZone.xMax, targetZone.xMin) - 10,
    xMax: Math.max(shipPosition.x, targetZone.xMax, targetZone.xMin) + 5,
    yMin: Math.min(shipPosition.y, targetZone.yMax, targetZone.yMin) - 10,
    yMax: Math.max(shipPosition.y, targetZone.yMax, targetZone.yMin) + 50,
  }
  const diff = {
    x: absoluteBox.xMax - absoluteBox.xMin,
    y: absoluteBox.yMax - absoluteBox.yMin,
  }
  const viewBox = {
    x: absoluteBox.xMin,
    y: absoluteBox.yMin,
    width: diff.x,
    height: diff.y,
  }
  const offset = {
    x: 0 - absoluteBox.xMin,
    y: 0 - absoluteBox.yMin,
  }
  const targetRect = {
    x: targetZone.xMin,
    y: targetZone.yMin,
    width: Math.abs(targetZone.xMax - targetZone.xMin),
    height: Math.abs(targetZone.yMax - targetZone.yMin),
  }
  const grid = makeZeroGrid(diff.x, diff.y)
  return {
    shipPosition,
    absoluteBox,
    targetRect,
    viewBox,
    diff,
    offset,
    grid,
  }
}

const convertCoordinates = ({x, y}) => {
  return {
    x: x + state.offset.x,
    y: state.diff.y - (y + state.offset.y),
  }
}

const isInGridBounds = (x, y) => {
  return !(
    x < 0
    || x >= state.grid[0].length
    || y < 0
    || y >= state.grid.length
  )
}

const isPointInRectBounds = ({x, y}, rect) => {
  return !(
    x < rect.x
    || x >= (rect.x + rect.width)
    || y < rect.y
    || y >= (rect.y + rect.height)
  )
}
const isPointPastTargetZone = ({x, y}) => {
  return y < targetZone.yMin || x > targetZone.xMax
}

const putValueIntoGrid = (value, position) => {
  const {x, y} = convertCoordinates(position)
  let previousValue = -1
  if (isInGridBounds(x, y)) {
    previousValue = state.grid[y][x]
    state.grid[y][x] = value
  }
  return previousValue
}

const drawRect = (value, rect) => {
  for (let y = 0; y < rect.height; y++) {
    for (let x = 0; x < rect.width; x++) {
      putValueIntoGrid(value, {
        x: rect.x + x,
        y: rect.y + y,
      })
    }
  }
}

const deepClone = (value) => JSON.parse(JSON.stringify(value))

let sensorVelocity = {}
let sensorPosition = {}
let state = {}

let currentTick = 0
let maxHeight = 0
let success = false
const setVelocityFromInput = () => {
  const yVelocity = parseInt(numberInput.value, 10)
  console.log({
    yVelocity
  })
  sensorVelocity = {
    x: 16,
    y: yVelocity
  }
}
numberInput.addEventListener('change', setVelocityFromInput)
const init = () => {
  currentTick = 0
  maxHeight = 0
  success = false
  state = makeGridWithTargetZone(targetZone)
  setVelocityFromInput()
  sensorPosition = deepClone(state.shipPosition)
  drawRect(2, state.targetRect)
  updateDisplay()
}

const updateDisplay = () => {
  putValueIntoGrid(1, state.shipPosition)
  statusGrid.innerText = displayGrid()
  statusText.innerText = [
    'currentTick: ' + currentTick,
    'maxHeight: ' + maxHeight,
    'success: ' + success,
  ].join('\n')
}

const tick = () => {
  currentTick += 1
  sensorPosition.x += sensorVelocity.x
  sensorPosition.y += sensorVelocity.y
  maxHeight = Math.max(maxHeight, sensorPosition.y)
  sensorVelocity.x = sensorVelocity.x
    ? (Math.abs(sensorVelocity.x) - 1) * Math.sign(sensorVelocity.x)
    : 0
  sensorVelocity.y -= 1
  success = isPointInRectBounds(sensorPosition, state.targetRect)
  putValueIntoGrid(3, sensorPosition)
  updateDisplay()
}

const endReached = () => {
  return (
    success
    || isPointPastTargetZone(sensorPosition)
  )
}
let tickInterval
const clickHandlerMap = {
  tick,
  tickAll () {
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
    init()
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

const displayRow = (row) => row.join('')
  .replace(/0/g, '.')
  .replace(/1/g, 'S')
  .replace(/2/g, 'T')
  .replace(/3/g, '#')

const displayGrid = () => {
  return state.grid
    .map(displayRow)
    .join('\n')
}
