import Cubus from './src'

const dimensions = [
  'time',
  'x',
  'y'
]

// new a cube with that three dimensions
const cube = new Cubus(dimensions)

// and add whatever value to dimensions
cube.addDimensionValue('time', '20180101')
cube.addDimensionValue('time', '20180102')
cube.addDimensionValue('time', '20180103')

cube.addDimensionValue('x', '4')
cube.addDimensionValue('x', '5')
cube.addDimensionValue('x', '6')

cube.addDimensionValue('y', '1')

// add datum to the cube
cube.add('A', {
  time: '20180101',
  x: '4',
  y: '1'
})

// why not chain it up?
cube
.add('B', {
  time: '20180101',
  x: '5',
  y: '1'
})
.add('C', {
  time: '20180102',
  x: '6',
  y: '1'
})
.add('D', {
  time: '20180103',
  x: '5',
  y: '1'
})
.add('E', {
  time:'20180101',
  x: '4',
  y: '2',
  z: '1'
})

console.log(JSON.stringify(cube.query({
  time: ['20180101', '20180102'],
  x: ['6']
}, true), null, 2))

console.log(JSON.stringify(cube.toJSON()))