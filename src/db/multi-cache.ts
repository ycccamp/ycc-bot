import {Fire} from './firestore'
import {MemoryStore} from './mem-store'
import {Store} from './types'
import {debug} from 'utils/logs'

type StrategyType = 'hybrid' | 'memory' | 'firestore'

interface CacheOptions {
  name?: string
  strategy: StrategyType
}

export class MultiCache implements Store<any> {
  name?: string
  strategy: StrategyType

  memory?: Store<any>
  firestore?: Store<any>

  constructor(options: CacheOptions) {
    this.name = options.name
    this.strategy = options.strategy

    this.setupStrategy()
  }

  setupStrategy() {
    if (this.strategy === 'firestore') {
      this.setupFirestore()
    } else if (this.strategy === 'memory') {
      this.setupMemory()
    } else {
      this.setupFirestore()
      this.setupMemory()
    }
  }

  setupFirestore() {
    if (!this.name) throw new Error('')

    this.firestore = new Fire(this.name)
  }

  setupMemory() {
    this.memory = new MemoryStore()
  }

  get cache() {
    switch (this.strategy) {
      case 'firestore':
        return this.firestore
      case 'memory':
        return this.memory
      default:
        return this.memory
    }
  }

  async _write(cb: (store: Store<any>) => any) {
    if (this.strategy === 'hybrid') {
      if (this.memory) cb(this.memory)
      if (this.firestore) await cb(this.firestore)
    }

    if (this.cache) await cb(this.cache)

    return true
  }

  async _read(cb: (store: Store<any>) => any, key?: string) {
    if (this.strategy === 'hybrid') {
      if (this.memory) {
        const m = await cb(this.memory)

        return this._withLog(m, 'In-Memory')
      }

      if (this.firestore) {
        const f = await cb(this.firestore)

        if (f) {
          this._saveInMemory(f, key)

          return this._withLog(f, 'Firestore')
        }
      }

      return null
    }

    if (this.cache) return cb(this.cache)
  }

  _withLog(data: any, type: string) {
    if (Array.isArray(data)) {
      if (data.length > 0) {
        debug(`Cache: ${type} (${data.length} records)`)

        return data
      }
    }

    if (data) {
      debug(`Cache: ${type}`)

      return data
    }

    return null
  }

  _saveInMemory(data: any, key?: string) {
    if (!this.memory) return

    if (Array.isArray(data)) {
      this.memory.setAll(data)
    } else if (key) {
      this.memory.set(key, data)
    }
  }

  async set(id: string, data: any) {
    this._write(s => s.set(id, data))
  }

  setAll(list: any[]) {
    this._write(s => s.setAll(list))
  }

  create(data: any): any {
    this._write(s => s.create(data))
  }

  async get(id: string): Promise<any | undefined> {
    return this._read(s => s.get(id), id)
  }

  list() {
    return this._read(s => s.list())
  }

  update(id: string, data: any) {
    this._write(s => s.update(id, data))
  }

  delete(id: string) {
    this._write(s => s.delete(id))
  }

  clear() {
    this._write(s => s.clear())
  }
}
