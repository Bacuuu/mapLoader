import LocalDB from './indexedDB.js'
const db = new LocalDB('map', 1)
// db.createObject('tiles')
const data = {
  level: 15, // 当前层级
  lngLat: [0, 0], // 中心点经纬度
  canvasWh: [0, 0], // [宽， 高] canvas宽高2
  centerTilePos: [0, 0], // 中心瓦片的行列号
  centerTileOffset: [0, 0], // 中心瓦片为了中心点对准视图中心而需要偏移的位置
  offlineCanvasScale: 3, // 离线canvas宽高放大倍数
  offlinecanvasWh: [0, 0], //offlinecanvas尺寸

  canvasCenter: [0, 0], // canvas中心点，[w/2, h/2]
  // offlineCanvas
  centerTile: [0, 0, 15], // 中心瓦片的行列号，tileX, tileY
  // tileOffset: [0, 0], // 中心瓦片左上角和真正中心点的偏移量，偏移的目的是为了中心对准真正的经纬度
  mouseOffset: [0, 0], // 鼠标累计偏移量，在鼠标左键松开后进行重置
  layers: {}, // 图层
  db
}


const exportData = new Proxy(data, {
  set: function (target, propKey, value, receiver) {
    const res = Reflect.set(target, propKey, value, receiver)
    // 定制处理
    // canvas宽高变化
    if (propKey === 'canvasWh') {
      data.offlinecanvasWh = [value[0] * data.offlineCanvasScale,
        value[1] * data.offlineCanvasScale]
      // 获取新的图片数据
      Object.values(data.layers).forEach(i => {
        i.reload()
      })
    } else if (propKey === 'level') {
      Object.values(data.layers).forEach(i => {
        i.reload()
      })
    } else if (propKey === 'lngLat') {
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