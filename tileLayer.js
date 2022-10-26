import globalData from "./globalData.js"
import { tileImgSize } from "./constant.js"
import canvasTool from './canvasTool.js'
export default class TileLayer {
  // 使用 x,y,z
  constructor (name, url) {
    this.tileUrl = url
    this.replaceUrlFunc = this.genReplaceTileUrl()
    this.reload()
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
    // 查看center位置
    // canvasTool.addText('center', globalData.canvasWh[0] / 2,  globalData.canvasWh[1] / 2)
    // 获取当前需要的图片数量
    let columns = Math.floor(globalData.canvasWh[0] / tileImgSize[0]) + 1
    columns += columns % 2
    let rows = Math.floor(globalData.canvasWh[1] / tileImgSize[1]) + 1
    rows += rows % 2
    globalData.grid = [columns + 1, rows + 1]
    const offset = [globalData.canvasWh[0] / 2 - globalData.tileOffset[0], globalData.canvasWh[1] / 2 - globalData.tileOffset[1]]
    const center = this.lonlat2TilePos()
    globalData.centerTile = center
    for (let c = -columns / 2; c <= columns / 2; c ++) {
      for (let r = -rows / 2; r <= rows / 2; r ++) {
        let _center = center
        canvasTool.addSingleImage(this.replaceUrlFunc(_center[0] + c, _center[1] + r, _center[2]), c * tileImgSize[0] + offset[0],r * tileImgSize[1] + offset[1])
        // canvasTool.addText(JSON.stringify([c, r]), c * tileImgSize[0] + offset[0],r * tileImgSize[1] + offset[1])
      }
    }
  }
}