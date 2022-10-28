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
    canvasTool.reloadTile(this.lonlat2TilePos(), this.genReplaceTileUrl())
  }
}