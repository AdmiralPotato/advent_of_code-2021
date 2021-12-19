const statusElement = document.getElementById('status')
const processInputFileText = (fileText) => {
  const scannerMap = {}

  fileText
    .trim()
    .split('\n\n')
    .forEach((block) => {
      let lines = block.split('\n');
      const label = lines
        .shift()
        .replace('--- ','')
        .replace(' ---','');
      scannerMap[label] = lines
        .map((line) => {
          return line
            .trim()
            .split(',')
            .map((string) => parseInt(string, 10))
        })
    })
  return scannerMap
}

const scannerMapPromise = fetch('./input.txt')
  .then((response) => response.text())
  .then(processInputFileText)

scannerMapPromise.then((scannerMap) => {
  const scanners = Object.values(scannerMap);

  // test one
  // const firstScannerVerts = scanners[0]
  // makeMeshesForVerts(firstScannerVerts)

  const sensorRadius = 1000
  const sceneCameraScale = 10 / sensorRadius
  allSceneMeshParent.scale.set(
    sceneCameraScale,
    sceneCameraScale,
    sceneCameraScale,
  )

  let totalVerts = 0
  scanners.forEach((verts, scannerIndex, scanners) => {
    totalVerts += verts.length
    makeMeshesForVerts(
      verts,
      scanners.length,
      scannerIndex
    )
  })

  statusElement.innerText = `totalVerts: ${totalVerts}`
})

