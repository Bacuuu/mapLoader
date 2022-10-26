import { domInsertCanvas, mouseClickOnMove, onResize } from './dom.js'
import TileLayer from './tileLayer.js'
import canvasTool from './canvasTool.js'
import globalData from './globalData.js'
import { throttle } from './tool.js'
import { tileImgSize } from './constant.js'
export default class MapLoader {
  constructor (domSelector) {
    // domid
    this.domSelector = domSelector
    this.setCanvasSize()
    const canvas = domInsertCanvas(domSelector)
    const el = document.getElementById(this.domSelector)
    // 自适应canvas
    const _setCanvasSize = throttle(1000, () => this.setCanvasSize())
    onResize(el, _setCanvasSize)
    canvasTool.setCtx(canvas)
    // 缩放canvas重绘
    const func = throttle(200, function (e) {
      if (e.wheelDelta > 0) {
        globalData.level ++
      } else if (e.wheelDelta < 0) {
        globalData.level --
      }
    })
    canvasTool.cavasZoom(e => func(e))
    mouseClickOnMove(el, e => {
      const x = e[1][0] - e[0][0]
      const y = e[1][1] - e[0][1]
      canvasTool.canvasMove(x, y)
      // moveFunc(e)
      // 拿到track去求像素，中心点
    })
  }
  addTileLayer (name, url) {
    const tileLayer = new TileLayer(name, url)
    globalData.layers[name] = tileLayer
  }
  setCanvasSize () {
    const el = document.getElementById(this.domSelector)
    const { width, height } = el.getBoundingClientRect()
    canvasTool.resizeTo(width, height)
    globalData.canvasWh = [
      width,
      height,
    ]
  }
}
