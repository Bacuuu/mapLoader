// 根据DOM元素替换为canvas
import globalData from "./globalData.js"
import { throttle } from "./tool.js"
let clickTrack = [null, null]
const domInsertCanvas = function (id) {
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
      console.log('---', entries)
      cb()
    }
  })
  resizeObserver.observe(el)
}

const mouseClickOnMove = function (el, cb) {
  const debounceFunc = throttle(16, e => {
    // 鼠标左键按下
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

export {
  domInsertCanvas,
  onResize,
  mouseClickOnMove
}