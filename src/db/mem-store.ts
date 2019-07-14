import {Store, BaseRecord} from './types'

const randomKey = () => Math.floor(Math.random() * 10000000).toString(36)

export class MemoryStore<T extends BaseRecord> implements Store<any> {
  cache = new Map<string, T>()

  set(id: string, data: T) {
    this.cache.set(id, data)
  }

  setAll(list: T[]) {
    for (let item of list) {
      this.cache.set(item.id, item)
    }
  }

  create(data: T): T {
    this.cache.set(data.id || randomKey(), data)

    return data
  }

  get(id: string): T | undefined {
    return this.cache.get(id)
  }

  list(): T[] {
    return Array.from(this.cache.entries()).map(([id, item]) => ({id, ...item}))
  }

  update(id: string, data: T) {
    this.cache.set(id, {...this.cache.get(id), ...data})
  }

  delete(id: string) {
    this.cache.delete(id)
  }
}
