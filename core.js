// import 
// 图层加载逻辑，计算图层图片位置
import globalData from './globalData.js'
/**
 * 根据经纬度计算瓦片行列号
 * @param {Array} pos [lng, lat, level]
 * @returns [tileX, tileY]
 */
const lnglat2TilePos = function (lnglat) {
  if (!lnglat) {
    lnglat = [...globalData.lngLat, globalData.level]
  }
  const { tileX:x, tileY:y } = TileLnglatTransform.TileLnglatTransformGaode.lnglatToTile(...lnglat)
  return [Math.ceil(x), Math.ceil(y)]
}


/**
 * 根据经纬度计算中心瓦片需要的偏移
 * @param {Array} lnglat [lng, lat, level]
 * @returns [pixelX, pixelY]
 */
const lnglat2CenterTileOffset = function (lnglat) {
  if (!lnglat) {
    lnglat = [...globalData.lngLat, globalData.level]
  }
  const { pixelX:x, pixelY:y } = TileLnglatTransform.TileLnglatTransformGaode.lnglatToPixel(...lnglat)
  return [x, y]
}

export {
  lnglat2TilePos,
  lnglat2CenterTileOffset
}