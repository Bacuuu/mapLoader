class EventBus {
  constructor () {
    this.eventMap = {}
  }
  // 触发
  emit (eventName, ...params) {
    return this.eventMap[eventName](params)
  }
  // 监听
  on (eventName, callback) {
    this.eventMap[eventName] = callback
  }
  // 取消监听
  off (eventName) {
    delete(this.eventMap[eventName])
  }
}