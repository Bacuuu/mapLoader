export const debounce = function () {

}

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