// 节流，函数触发则推迟执行
export const debounce = function (time, func) {
  let timer = null
  return function () {
    const _this = this
    const args = arguments
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.call(_this, ...args)
    }, timer)
  }
}

/**
 * 节流函数，返回函数在指定时间内只运行一次，如果在运行则不处理
 * @param {*} time 时长
 * @param {*} func 需处理的函数
 * @returns 
 */
export const throttle = function (time, func) {
  let timer = null;
  return function () {
    if (timer) return
    const _this = this
    const args = arguments
    timer = setTimeout(() => {
      func.call(_this, ...args)
      timer = null
    }, time)
  }
}