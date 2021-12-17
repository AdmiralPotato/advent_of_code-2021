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

const operatorNameMap = {
  0: 'sum',
  1: 'product',
  2: 'minimum',
  3: 'maximum',
  4: 'NUMBER LITERAL! DO NOT HANDLE HERE',
  5: 'greaterThan',
  6: 'lessThan',
  7: 'equalTo',
}
const operatorMap = {
  // Packets with type ID 0 are sum packets - their value is the sum of the values of their sub-packets. If they only have a single sub-packet, their value is the value of the sub-packet.
  sum (values) {
    let result = 0
    values.forEach((value) => result += value)
    return result
  },
  // Packets with type ID 1 are product packets - their value is the result of multiplying together the values of their sub-packets. If they only have a single sub-packet, their value is the value of the sub-packet.
  product (values) {
    let result = values[0]
    values.slice(1).forEach((value) => result *= value)
    return result
  },
  // Packets with type ID 2 are minimum packets - their value is the minimum of the values of their sub-packets.
  minimum (values) {
    return Math.min(...values)
  },
  // Packets with type ID 3 are maximum packets - their value is the maximum of the values of their sub-packets.
  maximum (values) {
    return Math.max(...values)
  },
  // Packets with type ID 5 are greater than packets - their value is 1 if the value of the first sub-packet is greater than the value of the second sub-packet; otherwise, their value is 0. These packets always have exactly two sub-packets.
  greaterThan (values) {
    return values[0] > values[1] ? 1 : 0
  },
  // Packets with type ID 6 are less than packets - their value is 1 if the value of the first sub-packet is less than the value of the second sub-packet; otherwise, their value is 0. These packets always have exactly two sub-packets.
  lessThan (values) {
    return values[0] < values[1] ? 1 : 0
  },
  // Packets with type ID 7 are equal to packets - their value is 1 if the value of the first sub-packet is equal to the value of the second sub-packet; otherwise, their value is 0. These packets always have exactly two sub-packets.
  equalTo (values) {
    return values[0] === values[1] ? 1 : 0
  },
}

const parseOperator = (_bits, typeId) => {
  const subPackets = []
  const operatorName = operatorNameMap[typeId]
  const result = {
    type: 'operator',
    operatorName,
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
      const subPacketResult = parseBits(subBits, subPackets)
      subBits = subPacketResult.remainingBits
    }
  } else {
    // number of sub-packets immediately contained
    const subPacketCount = parseInt(bits.slice(0, 11), 2)
    result.subPacketCount = subPacketCount
    bits = bits.slice(11)
    for (let i = 0; i < subPacketCount; i++) {
      const subPacketResult = parseBits(bits, subPackets)
      bits = subPacketResult.remainingBits
    }
  }
  const operator = operatorMap[operatorName]
  const values = subPackets.map((subPacket) => subPacket.value)
  result.operatorName = operatorName
  result.value = operator(values, result)
  result.remainingBits = bits
  result.subPackets = subPackets
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

  const merge = typeHandler(bits, typeId)
  Object.assign(result, merge)

  parseLog.push(result)
  // if (result.subResults) {
  //   parseLog.push(...result.subPackets)
  // }
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

const results = lines
  .map(parseSequence)
  .map((item) => item.slice(-1)[0].value)

console.log(JSON.stringify(results, null, '  '))
