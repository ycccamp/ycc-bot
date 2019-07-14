export interface BaseRecord {
  id: string
  createdAt: string
}

export interface Store<T extends BaseRecord> {
  set: (id: string, data: T) => T
  setAll: (data: T[]) => any
  create: (data: T) => T
  get: (id: string) => T
  list: () => T[] | Promise<T[]>
  update: (id: string, data: T) => T
  delete: (id: string) => T
}
