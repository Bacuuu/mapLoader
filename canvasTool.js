import { tileImgSize } from './constant.js'
import globalData from './globalData.js'
let ctx = null
let canvas = null
let offlineCanvas = null // 离线canvas
let offlineCtx = null
const setCtx = function (_canvas) {
  canvas = _canvas
  ctx = canvas.getContext('2d')
  offlineCanvas = document.createElement('canvas')
  offlineCanvas.width = canvas.width
  offlineCanvas.height = canvas.height
  offlineCtx = offlineCanvas.getContext('2d')
}

// 加载单个图片
const addSingleImage = function (url, x, y) {
  return new Promise((rs, rj) => {
    const img = new Image(256, 256)
    // 先去indexeddb查询数据
    globalData.db.readData('tiles', url).then(r => {
      img.src = window.URL.createObjectURL(r.data)
    }).catch(() => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url)
      xhr.responseType = 'blob'
      xhr.onload = function () {
        if (xhr.status === 200) {
          globalData.db.writeTo('tiles', {
            id: url,
            data: xhr.response
          })
          img.src = window.URL.createObjectURL(xhr.response)
        }
      }
      xhr.send()
    })
    img.onload = () => {
      offlineCtx.drawImage(img, 0, 0, 256, 256, x, y, ...tileImgSize)
      rs()
    }
    img.onerror = () => {
      rj()
    }
  })
}

const reloadTile = function (center, replaceUrlFunc) {
  let columns = Math.floor(globalData.canvasWh[0] / tileImgSize[0]) + 1
  columns += columns % 2
  let rows = Math.floor(globalData.canvasWh[1] / tileImgSize[1]) + 1
  rows += rows % 2
  globalData.grid = [columns + 1, rows + 1]
  const offset = [globalData.canvasWh[0] / 2 - globalData.tileOffset[0], globalData.canvasWh[1] / 2 - globalData.tileOffset[1]]
  globalData.centerTile = center
  const promiseList = []
  // clearOfflineCanvas()
  for (let c = -columns / 2; c <= columns / 2; c ++) {
    for (let r = -rows / 2; r <= rows / 2; r ++) {
      let _center = center
      promiseList.push(addSingleImage(replaceUrlFunc(_center[0] + c, _center[1] + r, _center[2]), c * tileImgSize[0] + offset[0],r * tileImgSize[1] + offset[1]))
    }
  }
  Promise.all(promiseList)
    .then(r => {
      clearCanvas()
      ctx.drawImage(offlineCanvas, 0, 0)
    })
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
    offlineCanvas.width = width
    offlineCanvas.height = height
  }
}

const cavasZoom = function (cb) {
  canvas.addEventListener('wheel', function (e) {
    cb(e)
  })
}

// 画布平移
const canvasMove = function (x, y) {
  // canvasTranslate(x, y)
  // 如果是右下角移动，那么x,y都是正的
  // 对于偏移来说，图片右下移动，偏移量减少，更偏向于图片原点
  const currentOffsetX = -x + globalData.tileOffset[0]
  const currentOffsetY = -y + globalData.tileOffset[1]
  const tileOffsetX = Math.floor(currentOffsetX / tileImgSize[0])
  const tileOffsetY = Math.floor(currentOffsetY / tileImgSize[1])
  const tilePixelOffsetX = (currentOffsetX - tileOffsetX * tileImgSize[0]) % tileImgSize[0]
  const tilePixelOffsetY = (currentOffsetY - tileOffsetY * tileImgSize[1]) % tileImgSize[1]
  const { lng, lat } = TileLnglatTransform.TileLnglatTransformGaode.pixelToLnglat(
    tilePixelOffsetX,
    tilePixelOffsetY,
    tileOffsetX + globalData.centerTile[0],
    tileOffsetY + globalData.centerTile[1],
    globalData.centerTile[2])
  globalData.lngLat = [lng, lat]
  // ctx.translate(x, y)
  // Object.values(globalData.layers).forEach(i => {
  //   i.reload()
  // })
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
  canvasMove,
  canvasTranslate
}