import { tileImgSize } from './constant.js'
import globalData from './globalData.js'
import { debounce, throttle } from './tool.js'
let ctx = null
let canvas = null
let offlineCanvas = null // 离线canvas
let offlineCtx = null
const setCtx = function (_canvas) {
  canvas = _canvas
  ctx = canvas.getContext('2d')
  offlineCanvas = document.createElement('canvas')
  offlineCanvas.width = globalData.offlinecanvasWh[0]
  offlineCanvas.height = globalData.offlinecanvasWh[1]
  offlineCtx = offlineCanvas.getContext('2d')
}

// 加载单个图片
const addSingleImage = function (url, x, y) {
  return new Promise((rs, rj) => {
    const img = new Image(256, 256)
    // 先去indexeddb查询数据
    // globalData.db.readData('tiles', url).then(r => {
    //   img.src = window.URL.createObjectURL(r.data)
    // }).catch(() => {
    //   const xhr = new XMLHttpRequest()
    //   xhr.open('GET', url)
    //   xhr.responseType = 'blob'
    //   xhr.onload = function () {
    //     if (xhr.status === 200) {
    //       globalData.db.writeTo('tiles', {
    //         id: url,
    //         data: xhr.response
    //       })
    //       img.src = window.URL.createObjectURL(xhr.response)
    //     }
    //   }
    //   xhr.send()
    // })
    img.src = url
    img.onload = () => {
      offlineCtx.drawImage(img, 0, 0, 256, 256, x, y, ...tileImgSize)
      rs()
    }
    img.onerror = () => {
      rj()
    }
  })
}

/**
 * 重新加载瓦片数据
 * @param {Function} replaceUrlFunc (x, y, level) => url
 */
const reloadTile = function (replaceUrlFunc) {
  const wh = globalData.offlinecanvasWh
  let columns = Math.floor(wh[0] / tileImgSize[0]) + 1
  columns += columns % 2
  let rows = Math.floor(wh[1] / tileImgSize[1]) + 1
  rows += rows % 2
  const offset = [wh[0] / 2 - globalData.tileOffset[0],
    wh[1] / 2 - globalData.tileOffset[1]]
  globalData.centerTileOffset = center
  const promiseList = []
  // clearOfflineCanvas()
  for (let c = -columns / 2; c <= columns / 2; c ++) {
    for (let r = -rows / 2; r <= rows / 2; r ++) {
      let _center = center
      promiseList.push(addSingleImage(replaceUrlFunc(_center[0] + c, _center[1] + r, _center[2]),
      c * tileImgSize[0] + offset[0],
      r * tileImgSize[1] + offset[1]))
    }
  }
  Promise.all(promiseList)
    .then(r => {
      clearCanvas()
      offlineCvsToCvs(0, 0)
    })
}

const offlineCvsToCvs = function (x, y) {
  ctx.drawImage(offlineCanvas,
    x - globalData.offlinecanvasWh[0] / 3,
    y - globalData.offlinecanvasWh[1] / 3)
}

const addText = function (content, x, y) {
  ctx.fillText(content, x, y)
}

const resizeTo = function (width, height) {
  if (canvas) {
    canvas.width = width
    canvas.height = height
  }
  if (offlineCanvas) {
    offlineCanvas.width = width * 3
    offlineCanvas.height = height * 3
  }
}

const cavasZoom = function (cb) {
  const debounceCb = debounce(100, cb)
  canvas.addEventListener('wheel', function (e) {
    debounceCb(e)
  })
}

// 画布平移
const canvasMove = function (x, y) {
  globalData.mouseOffset = [globalData.mouseOffset[0] + x, globalData.mouseOffset[1] + y]
  offlineCvsToCvs(...globalData.mouseOffset)
}


const computeLnglat = () => {
  // debugger
  // 坐标原点到之前中心瓦片左上角的矢量坐标
  const currentOffsetX = -globalData.centerTileOffset[0] + globalData.mouseOffset[0]
  const currentOffsetY = -globalData.centerTileOffset[1] + globalData.mouseOffset[1]
  // 置空
  globalData.mouseOffset = [0, 0]
  // 行列号的变化
  const tileOffsetX = -Math.ceil(currentOffsetX / tileImgSize[0]) - 1
  const tileOffsetY = -Math.floor(currentOffsetY / tileImgSize[1]) - 1
  // 新中心瓦片的像素偏移
  const tilePixelOffsetX = Math.abs(currentOffsetX + tileImgSize[0] * tileOffsetX)
  const tilePixelOffsetY = Math.abs(currentOffsetY + tileImgSize[1] * tileOffsetY)
  const { lng, lat } = TileLnglatTransform.TileLnglatTransformGaode.pixelToLnglat(
    tilePixelOffsetX,
    tilePixelOffsetY,
    tileOffsetX + globalData.centerTilePos[0],
    tileOffsetY + globalData.centerTilePos[1],
    globalData.level)
    console.log([lng, lat])
  globalData.lngLat = [lng, lat]
}

const canvasTranslate = function (x, y) {
  ctx.translate(x, y)
}

const clearCanvas = function () {
  ctx.clearRect(0, 0, ...globalData.canvasWh)
}

const clearOfflineCanvas = function () {
  offlineCtx.clearRect(0, 0, ...globalData.canvasWh)
}

export default {
  setCtx,
  addSingleImage,
  resizeTo,
  cavasZoom,
  reloadTile,
  addText,
  clearCanvas,
  canvasMove,
  offlineCvsToCvs,
  computeLnglat,
  canvasTranslate
}