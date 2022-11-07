import { lnglat2CenterTileOffset, lnglat2TilePos } from './core.js'
import globalData from "./globalData.js"
import { tileImgSize } from "./constant.js"
import canvasTool from './canvasTool.js'
export default class TileLayer {
  // 使用 x,y,z
  constructor (name, url) {
    this.tileUrl = url
    this.replaceUrlFunc = this.genReplaceTileUrl()
  }
  // 根据模板路径进行替换
  genReplaceTileUrl () {
    return (x, y, z) => {
      return this.tileUrl.replace(/{x}/, x)
        .replace(/{y}/, y)
        .replace(/{z}/, z)
    }
  }
  lonlat2TilePos () {
    const {tileX:x, tileY:y} = TileLnglatTransform.TileLnglatTransformGaode.lnglatToTile(...globalData.lngLat, globalData.level)
    return [Math.ceil(x), Math.ceil(y), globalData.level]
  }
  reload () {
    // 计算中心瓦片地址
    const [colIndex, rowIndex] = globalData.centerTilePos = lnglat2TilePos()
    const [offsetX, offsetY] = globalData.centerTileOffset = lnglat2CenterTileOffset()
    const genUrl = this.genReplaceTileUrl()
    // 根据经纬度计算行列号
    const width = globalData.offlinecanvasWh[0]
    const height = globalData.offlinecanvasWh[1]
    const tileOffsetLeft = Math.ceil((width / 2 - offsetX) / tileImgSize[0])
    const tileOffsetRight = Math.ceil((width / 2 + offsetX) / tileImgSize[0]) - 1
    const tileOffsetTop = Math.ceil((height / 2 - offsetY) / tileImgSize[1])
    const tileOffsetBottom = Math.ceil((height / 2 + offsetY) / tileImgSize[1]) - 1
    let promiseList = []
    for (let col = -tileOffsetLeft; col <= tileOffsetRight; col ++) {
      for (let row = -tileOffsetTop; row <= tileOffsetBottom; row ++) {
        promiseList.push(
          canvasTool.addSingleImage(
            genUrl(colIndex + col, rowIndex + row, globalData.level),
            width / 2 - offsetX + col * tileImgSize[0],
            height / 2 - offsetY + row * tileImgSize[1],
          )
        )
      }
    }
    Promise.all(promiseList)
      .then(r => {
        canvasTool.clearCanvas()
        canvasTool.offlineCvsToCvs(0, 0)
      })
  }
}