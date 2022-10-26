import LocalDB from './indexedDB.js'
const db = new LocalDB('map', 1)
db.createObject('tiles')
const data = {
  level: 15, // 层级
  lngLat: [0, 0], // 经纬度
  canvasWh: [0, 0], // [宽， 高] canvas宽高
  canvasCenter: [0, 0], // 中心点
  centerTile: [0, 0, 15], // 中心瓦片的行列号，tileX, tileY
  tileOffset: [0, 0], // 中心瓦片的偏移量，偏移的目的是为了中心对准真正的经纬度
  // 根据中心经纬度计算像素
  grid: [],
  layers: {}, // 图层
  db
}


const exportData = new Proxy(data, {
  set: function (target, propKey, value, receiver) {
    const res = Reflect.set(target, propKey, value, receiver)
    // 定制处理
    // canvas宽高变化
    if (propKey === 'canvasWh') {
      data.canvasCenter = [value[0] / 2, value[1] / 2]
      // 获取新的图片数据
      Object.values(data.layers).forEach(i => {
        i.reload()
      })
    } else if (propKey === 'level') {
      Object.values(data.layers).forEach(i => {
        i.reload()
      })
    } else if (propKey === 'lngLat') {
      const lnglat = TileLnglatTransform.TileLnglatTransformGaode.lnglatToPixel(...data.lngLat, data.level)
      data.tileOffset = [lnglat.pixelX, lnglat.pixelY]
      Object.values(data.layers).forEach(i => {
        i.reload()
      })
    }
    return res
  }
})

const initLngLat = [106.4, 29.2]
exportData.lngLat = initLngLat
exportData.level = 15
export default exportData