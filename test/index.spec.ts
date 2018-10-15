import test from 'tape'
import DataCube from '../src/index'

const dimensions = [
  'time',
  'appid',
  'index'
]

test('test', function(t) {
  t.pass()

  t.end()
})

const cube = new DataCube<number>(dimensions)

cube.addDimensionValue('time', '20180101')
cube.addDimensionValue('time', '20180102')
cube.addDimensionValue('time', '20180103')

cube.addDimensionValue('appid', 'wx1')
cube.addDimensionValue('appid', 'wx2')
cube.addDimensionValue('appid', 'wx3')

cube.addDimensionValue('index', 'cnt')

cube.add(1, {
  time: '20180101',
  appid: 'wx1',
  index: 'cnt'
}).add(2, {
  time: '20180102',
  appid: 'wx2',
  index: 'cnt'
}).add(3, {
  time: '20180101',
  appid: 'wx1',
  index: 'cnt'
}, true).add(4, {
  time: '20180101',
  appid: 'wx4',
  index: 'cnt'
}).add(undefined, {
  time: '20180103',
  appid: 'wx2',
  index: 'cnt'
})

console.log(cube.query({
  appid: ['wx1', 'wx2']
}))
console.log(cube.query({
  appid: ['wx1', 'wx2']
}, true))
console.log(cube)
const exportJSON = cube.toJSON()
console.log(JSON.stringify(exportJSON, null, 2))
const newDataCube = new DataCube<number>([]).fromJSON(exportJSON)
console.log(newDataCube)

cube.remove({
  appid: ['wx2']
})
console.log(cube)

cube.clear()
console.log(cube)