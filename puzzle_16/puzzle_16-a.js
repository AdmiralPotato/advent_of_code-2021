const fs = require('fs')
const path = require('path')
const dataPath = path.join(__dirname , 'input.txt')
const lines = fs.readFileSync(dataPath, 'utf-8')
  .trim()
  .split('\n')
  .map((line) => line.trim())

const parseLiteral = (_bits) => {
  const result = {
    type: 'number literal'
  }
  let bits = _bits
  let total = ''
  let advance = '1'
  while (advance === '1') {
    advance = bits[0]
    total += bits.slice(1, 5)
    bits = bits.slice(5)
  }
  result.value = parseInt(total, 2)
  result.remainingBits = bits
  return result
}

const parseOperator = (_bits) => {
  const subResults = []
  const result = {
    type: 'operator',
    subResults,
  }
  const lengthTypeId = _bits[0]
  let bits = _bits.slice(1)
  if (lengthTypeId === '0') {
    // total length in bits of the sub-packets contained
    const subPacketLength = parseInt(bits.slice(0, 15), 2)
    result.subPacketLength = subPacketLength
    bits = bits.slice(15)
    let subBits = bits.slice(0, subPacketLength)
    bits = bits.slice(subPacketLength)
    while (subBits) {
      const subPacketResult = parseBits(subBits, subResults)
      subBits = subPacketResult.remainingBits
    }
  } else {
    // number of sub-packets immediately contained
    const subPacketCount = parseInt(bits.slice(0, 11), 2)
    result.subPacketCount = subPacketCount
    bits = bits.slice(11)
    for (let i = 0; i < subPacketCount; i++) {
      const subPacketResult = parseBits(bits, subResults)
      bits = subPacketResult.remainingBits
    }
  }
  result.remainingBits = bits
  return result
}

const parseBits = (_bits, parseLog) => {
  let bits = _bits
  const version = parseInt(bits.slice(0, 3), 2)
  const typeId = parseInt(bits.slice(3, 6), 2)
  bits = bits.slice(6)
  const typeHandler = (typeId === 4)
    ? parseLiteral
    : parseOperator
  const result = {
    version,
    typeId,
    remainingBits: bits
  }

  const merge = typeHandler(bits)
  Object.assign(result, merge)

  parseLog.push(result)
  if (result.subResults) {
    parseLog.push(...result.subResults)
  }
  return result
}

const hexBinLookup = {
  0: '0000',
  1: '0001',
  2: '0010',
  3: '0011',
  4: '0100',
  5: '0101',
  6: '0110',
  7: '0111',
  8: '1000',
  9: '1001',
  A: '1010',
  B: '1011',
  C: '1100',
  D: '1101',
  E: '1110',
  F: '1111',
}

const hexToBin = (hexString) => hexString
  .split('')
  .map((char) => hexBinLookup[char])
  .join('')

const parseSequence = (sequence) => {
  const parseLog = []
  let bits = hexToBin(sequence)
  while (bits.length > 7) {
    const parseResult = parseBits(bits, parseLog)
    bits = parseResult.remainingBits
  }
  return parseLog
}

const totalVersionNumbers = (parsedSequence) => {
  let result = 0;
  parsedSequence.forEach((item) => {
    result += item.version
  })
  return result
}

const results = lines
  .map(parseSequence)
  .map(totalVersionNumbers)

console.log(JSON.stringify(results, null, '  '))
