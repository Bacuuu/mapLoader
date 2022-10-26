export default class LocalDB {
  /**
   * @param {*} dbName 数据库名
   * @param {*} version 
   */
  constructor (dbName, version) {
    this.isInit = false
    this.queueBeforeInit = []
    const req = indexedDB.open(dbName, version)
    req.onerror = () => {
      console.error('创建db出错')
      throw Error('创建db出错')
    }
    req.onsuccess = () => {
      console.log('success')
      this.ctx = req.result
      this.isInit = true
      // 执行queue
      for (let i = 0; i < this.queueBeforeInit.length; i++) {
        this.queueBeforeInit[i]()
      }
    }
    req.onupgradeneeded = evt => {
      console.warn(`数据库版本已升级，老版本:${evt.oldVersion}，新版本:${evt.newVersion}`)
      this.ctx = evt.target.result
    }
  }
  /**
   * 默认主键为id
   * @param {*} schemaName 表名
   */
  createObject (schemaName) {
    // 未初始化完成，放入队列
    if (!this.isInit) {
      this.queueBeforeInit.push(() => {
        this.createObject.call(this, ...arguments)
      })
    } else {
      if (!this.ctx.objectStoreNames.contains(schemaName)) {
        this.ctx.createObjectStore(schemaName, { keyPath: 'id' });
      }
    }
  }
  /**
   * 向表里写数据
   * @param {*} schemaName 
   * @param {*} operation readwrite | readonly
   */
  async writeTo (schemaName, data, operation = 'readwrite') {
    // 未初始化完成，放入队列
    if (!this.isInit) {
      this.queueBeforeInit.push(() => {
        this.writeTo.call(this, ...arguments)
      })
    } else {
      const req = this.ctx.transaction([schemaName], operation)
        .objectStore(schemaName)
        .add(data)
  
      req.onsuccess = function () {
        console.log('数据写入成功');
      };
  
      req.onerror = function (e) {
        console.log(e)
        console.log('数据写入失败');
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
          console.log('!!' + err)
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