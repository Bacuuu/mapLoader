import { canvasInsertToDom, mouseClickOnMove, mouseUp, onResize } from './dom.js'
import TileLayer from './tileLayer.js'
import canvasTool from './canvasTool.js'
import globalData from './globalData.js'
import { throttle } from './tool.js'
import { tileImgSize } from './constant.js'
export default class MapLoader {
  constructor (domSelector) {
    // domid
    this.domSelector = domSelector
    // 初始化canvas尺寸
    this.setCanvasSize()
    // 插入dom
    const canvas = canvasInsertToDom(domSelector)
    // 监听父元素，使canvas自适应
    const _setCanvasSize = throttle(1000, () => this.setCanvasSize())
    const el = document.getElementById(this.domSelector)
    onResize(el, _setCanvasSize)
    // 保存变量
    canvasTool.setCtx(canvas)
    // 缩放canvas重绘
    const debounceZoom = function (e) {
      if (e.wheelDelta > 0) {
        globalData.level ++
      } else if (e.wheelDelta < 0) {
        globalData.level --
      }
    }
    canvasTool.cavasZoom(e => debounceZoom(e))
    // 点击拖拽事件
    mouseClickOnMove(el, e => {
      const x = e[1][0] - e[0][0]
      const y = e[1][1] - e[0][1]
      canvasTool.canvasMove(x, y)
    })
    mouseUp(el, () => {
      // 重新加载数据
      canvasTool.computeLnglat()
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
