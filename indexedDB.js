export default class LocalDB {
  /**
   * @param {*} dbName 数据库名
   * @param {*} version 
   */
  constructor (dbName, version) {
    this.isInit = false
    this.queueBeforeInit = [] // 初始化完成之前需要处理的函数
    this.isWritingIds = [] // 正在写入的数据id
    const req = indexedDB.open(dbName, version)
    req.onerror = () => {
      console.error('创建/连接db出错')
      throw Error('创建/连接db出错')
    }
    req.onsuccess = () => {
      this.ctx = req.result
      this.flushCallbacks()
    }
    req.onupgradeneeded = evt => {
      console.warn(`数据库版本已升级，老版本:${evt.oldVersion}，新版本:${evt.newVersion}`)
      this.ctx = evt.target.result
      const objectStore = this.createObject('tiles')
      // 初次创建数据库时，等事务完成后再调用，避免read报错（虽然没有数据
      objectStore.transaction.oncomplete = () => {
        this.flushCallbacks()
      }
    }
  }
  // 执行queue中的回调函数
  flushCallbacks () {
    if (!this.isInit) {
      this.isInit = true
      // 执行queue
      for (let i = 0; i < this.queueBeforeInit.length; i++) {
        this.queueBeforeInit[i]()
      }
    }
    this.queueBeforeInit = []
  }
  /**
   * 默认主键为id
   * @param {*} schemaName 表名
   */
  createObject (schemaName) {
    if (!this.ctx.objectStoreNames.contains(schemaName)) {
      const objectStore = this.ctx.createObjectStore(schemaName, { keyPath: 'id' });
      return objectStore
    }
  }
  /**
   * 向表里写数据
   * @param {*} schemaName 
   * @param {*} operation readwrite | readonly
   */
  async writeTo (schemaName, data, operation = 'readwrite') {
    // 如果已经在处理中，不进行重复的处理
    // 因为在本业务中，同一key数据应该是统一的
    if (this.isWritingIds.includes(data.id)) return
    // 未初始化完成，放入队列
    if (!this.isInit) {
      this.queueBeforeInit.push(() => {
        this.writeTo.call(this, ...arguments)
      })
    } else {
      this.isWritingIds.push(data.id)
      const req = this.ctx.transaction([schemaName], operation)
        .objectStore(schemaName)
        .add(data)
        
      req.onsuccess = () => {
        console.log('数据写入成功');
        this.isWritingIds.splice(this.isWritingIds.indexOf(data.id), 1)
      };
  
      req.onerror = () => {
        console.log('数据写入失败');
        this.isWritingIds.splice(this.isWritingIds.indexOf(data.id), 1)
      }
    }
  }

  readData (schemaName, key) {
    return new Promise((rs, rj) => {
      // 未初始化完成，放入队列
      if (!this.isInit) {
        this.queueBeforeInit.push(() => {
          this.readData.call(this, ...arguments)
        })
      } else {
        const transaction = this.ctx.transaction([schemaName])
        const store = transaction.objectStore(schemaName)
        const req = store.get(key)
        req.onsuccess = () => {
          rs(req.result)
        }
        req.onerror = err => {
          rj(err)
        }
      }
    })
  }

  // 关闭数据库连接
  close () {
    // 未初始化完成，放入队列
    if (!this.isInit) {
      this.queueBeforeInit.push(() => {
        this.close.call(this, ...arguments)
      })
    } else {
      this.ctx.close()
    }
  }
}