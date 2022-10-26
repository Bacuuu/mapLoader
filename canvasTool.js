import { tileImgSize } from './constant.js'
import globalData from './globalData.js'
let ctx = null
let canvas = null
const setCtx = function (_canvas) {
  canvas = _canvas
  ctx = canvas.getContext('2d')
}

// 加载单个图片
const addSingleImage = function (url, x, y) {
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
    ctx.drawImage(img, 0, 0, 256, 256, x, y, ...tileImgSize)
  }
}

const addText = function (content, x, y) {
  ctx.fillText(content, x, y)
}

const resizeTo = function (width, height) {
  if (canvas) {
    canvas.width = width
    canvas.height = height
  }
}

const cavasZoom = function (cb) {
  canvas.addEventListener('wheel', function (e) {
    cb(e)
  })
}

// 画布平移
const canvasMove = function (x, y) {
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

export default {
  setCtx,
  addSingleImage,
  resizeTo,
  cavasZoom,
  addText,
  canvasMove
}