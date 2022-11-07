// 根据DOM元素替换为canvas
import { tileImgSize } from "./constant.js"
import globalData from "./globalData.js"
import { throttle } from "./tool.js"
let clickTrack = [null, null]
const canvasInsertToDom = function (id) {
  const el = document.getElementById(id)
  const canvas = document.createElement('canvas')
  canvas.width = globalData.canvasWh[0]
  canvas.height = globalData.canvasWh[1]
  el.appendChild(canvas)
  return canvas
}

const onResize = function (el, cb) {
  const resizeObserver = new ResizeObserver((entries) => {
    if (entries) {
      cb()
    }
  })
  resizeObserver.observe(el)
}

const mouseClickOnMove = function (el, cb) {
  const debounceFunc = throttle(16, e => {
    // console.log(e.x, e.y)
    // const currentOffsetX = -globalData.centerTileOffset[0] + e.x
    // const currentOffsetY = -globalData.centerTileOffset[1] + e.y
    // const tileOffsetX = Math.floor(currentOffsetX / tileImgSize[0])
    // const tileOffsetY = Math.floor(currentOffsetY / tileImgSize[1])
    // 鼠标左键按下，按下时记录起始数值
    if (e.buttons === 1) {
      if (!clickTrack[1]) {
        clickTrack[1] = [e.offsetX, e.offsetY]
      } else {
        clickTrack[0] = clickTrack[1]
        clickTrack[1] = [e.offsetX, e.offsetY]
        cb(clickTrack)
      }
    } else {
      clickTrack = [null, null]
    }
  })
  el.addEventListener('mousemove', debounceFunc)
}

const mouseUp = function (el, cb) {
  el.addEventListener('mouseup', () => {
    cb()
  })
}

export {
  canvasInsertToDom,
  onResize,
  mouseClickOnMove,
  mouseUp
}