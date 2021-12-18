// written as a snippet in the browser. wasn't able to make it work in any reasonable time
var testCases = [
	{
		name: 'basic addition',
		input:`
			[1,2]
			[[3,4],5]
		`,
		expected: '[[1,2],[[3,4],5]]'
	},
	{
		name: 'explode a',
		input:`
			[[[[[9,8],1],2],3],4]
		`,
		expected: '[[[[0,9],2],3],4]'
	},
	{
		name: 'explode b',
		input:`
			[7,[6,[5,[4,[3,2]]]]]
		`,
		expected: '[7,[6,[5,[7,0]]]]'
	},
	{
		name: 'explode c',
		input:`
			[[6,[5,[4,[3,2]]]],1]
		`,
		expected: '[[6,[5,[7,0]]],3]'
	},
	{
		name: 'explode d',
		input:`
			[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]
		`,
		expected: '[[3,[2,[8,0]]],[9,[5,[7,0]]]]'
	},
	{
		name: 'explode e',
		input:`
			[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]
		`,
		expected: '[[3,[2,[8,0]]],[9,[5,[7,0]]]]'
	},
	{
		name: 'compound add a',
		input:`
			[1,1]
			[2,2]
			[3,3]
			[4,4]
		`,
		expected: '[[[[1,1],[2,2]],[3,3]],[4,4]]'
	},
	{
		name: 'compound add b',
		input:`
			[1,1]
			[2,2]
			[3,3]
			[4,4]
			[5,5]
		`,
		expected: '[[[[3,0],[5,3]],[4,4]],[5,5]]'
	},
	{
		name: 'compound add c',
		input:`
			[1,1]
			[2,2]
			[3,3]
			[4,4]
			[5,5]
			[6,6]
		`,
		expected: '[[[[5,0],[7,4]],[5,5]],[6,6]]'
	},
	{
		name: 'multi-phase resolution after add',
		input:`
			[[[[4,3],4],4],[7,[[8,4],9]]]
			[1,1]
		`,
		expected: '[[[[0,7],4],[[7,8],[6,0]]],[8,1]]'
	},
	{
		name: 'slightly larger example',
		input:`
			[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]
			[7,[[[3,7],[4,3]],[[6,3],[8,8]]]]
			[[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]
			[[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]
			[7,[5,[[3,8],[1,4]]]]
			[[2,[2,2]],[8,[8,1]]]
			[2,9]
			[1,[[[9,3],9],[[9,0],[0,7]]]]
			[[[5,[7,4]],7],1]
			[[[[4,2],2],6],[8,7]]
		`,
		expected: '[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]'
	}
]


var prepareInput = (inputString) => inputString.trim().split('\n').map((line)=>line.trim())

var depthRegex = /(\[+)/
var getDeepestDepth = (array) => {
	var depth = 0
	var onlySquareBrackets = JSON.stringify(array).replace(/\d|,/g, '')
	console.log('before:', onlySquareBrackets)
	var iteration = 0
	while (onlySquareBrackets.indexOf('][') !== -1) {
		iteration += 1
		onlySquareBrackets = onlySquareBrackets.replace('][', '')
		// console.log(`iteration: ${iteration} = ${onlySquareBrackets}`)
	}
	var depthTest = depthRegex.exec(onlySquareBrackets)
	if (depthTest) {
		depth = depthTest[0].length
	}
	return depth
}

var deepClone = (input) => JSON.parse(JSON.stringify(input))

var climbBackDownTheOppositeSide = (firstParent, climbingSide, value) => {
	var parent = firstParent
	while (parent) {
		var slot = parent[climbingSide]
		if (Array.isArray(slot)) {
			parent = slot
		} else {
			parent[climbingSide] += value
			parent = undefined
		}
	}
}

var addNumberToFirstLeafAtIndex = (firstParent, index, value) => {
	var parent = firstParent
	var otherIndex = index ? 0 : 1
	while (parent) {
		var slot = parent[index]
		if (Array.isArray(slot)) {
// 			if(nextParent) {
// 				var nextSlot = nextParent[index]
// 				var nextSlotIsSelf = nextSlot === slot
// 				var nextSlotIsArray = Array.isArray(nextSlot)
// 				if (nextSlotIsSelf) {
// 					parent = nextParent
// 				} else if (nextSlotIsArray) { // it's a sibling
// // 					climbBackDownTheOppositeSide(nextSlot, otherIndex, value)
// 					parent = undefined
// 				} else if (!nextSlotIsArray) {
// 					nextParent[index] += value
// 					parent = undefined
// 				}
// 			} else {
// 				parent = nextParent
// 			}
// 			var otherIndex = index ? 0 : 1
// 			if (!parent.parent) {
// 				var otherValue = parent[otherIndex]
// 				if (Array.isArray(otherValue)) {
//
// 				} else {
// 					//
// 				}
// 				parent = undefined
// 			} else {
// 				parent = parent.parent
// 			}
// 			var nextParent = parent.parent
// 			if (!nextParent) {
// 				var nextSlot = parent[index]
// 				var nextSlotIsSibling = nextSlot !== slot
// 				if (nextSlotIsSibling && Array.isArray(nextSlot)) {
// 					climbBackDownTheOppositeSide(nextSlot, otherIndex, value)
// 				}
// 				parent = undefined
// 			} else {
// 			}
			parent = parent.parent
		} else {
			parent[index] += value
			parent = undefined
		}
	}
}

var handleExplodeAtDepth = (level, index, nextDepth) => {
	var exploded = explodeAtDepth(level[index], nextDepth)
	var otherIndex = index ? 0 : 1
	if (exploded) {
		level[index] = 0
		addNumberToFirstLeafAtIndex(level.parent, index, exploded[index])
		addNumberToFirstLeafAtIndex(level, otherIndex, exploded[otherIndex])
	}
}

var explodeAtDepth = (level, depth) => {
	var [a, b] = level
	var nextDepth = depth + 1
	var aIsArray = Array.isArray(a)
	var bIsArray = Array.isArray(b)
	if (aIsArray) {
		handleExplodeAtDepth(level, 0, nextDepth)
	}
	if (bIsArray) {
		handleExplodeAtDepth(level, 1, nextDepth)
	}
	if((!aIsArray && !bIsArray) && depth > 3) {
		// explode????
		// neither is array, both are numbers
		return level
	}
}

var linkParents = (parent) => {
	parent.forEach((child) => {
		if (Array.isArray(child)) {
			child.parent = parent
			linkParents(child)
		}
	})
}

var explode = (input) => {
	var result = deepClone(input)
	linkParents(result)
	explodeAtDepth(result, 0)
	return result
}

var validateStupidNumber = (input) => {
	var depth = getDeepestDepth(input)
	var result = deepClone(input)
	console.log(`depth: ${depth}; input: ${JSON.stringify(input)}`)
	while (depth >= 5) {
		result = explode(result)
		depth = getDeepestDepth(result)
	}
	return result
}

var addStupidNumbers = (a, b) => {
	return [a, b]
}


var runUnitSnainMathUnitTest = ({name, input, expected}) => {
	var parsedInput = prepareInput(input)
	console.warn(parsedInput)
	var snailNumber = null
	var prevalidate = null
	parsedInput.forEach((line) => {
		var item = JSON.parse(line)
		if (!snailNumber) {
			snailNumber = item
		} else {
			snailNumber = addStupidNumbers(snailNumber, item)
		}
		prevalidate = JSON.stringify(snailNumber)
		snailNumber = validateStupidNumber(snailNumber)
	})
	var resultss = JSON.stringify(snailNumber)
	var success = expected === resultss
	return {
		name,
		success,
		expected,
		prevalidate,
		resultss
	}
}


var results = testCases.map(runUnitSnainMathUnitTest)
var success = results.filter((item) => item.success)
var faulres = results.filter((item) => !item.success)

console.log('Success:', )
console.table(success)
console.log('Failures')
console.table(faulres)

