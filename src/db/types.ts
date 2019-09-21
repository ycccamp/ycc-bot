export type BaseFields = {
  id: string,
  createdAt: Date
}

export type BaseRecord<T> = T & BaseFields

export interface Options<T extends BaseFields> {
  max?: number
  view?: string
  fields?: FieldMapping<T>
  transform?: TransformFn<T>
}

export interface Store<T extends BaseFields> {
  set: (id: string, data: T) => T
  setAll: (data: T[]) => any
  create: (data: T) => T
  get: (id: string) => T
  list: () => T[] | Promise<T[]>
  update: (id: string, data: T) => T
  delete: (id: string) => T
  clear: () => void | Promise<void>
}

export type FieldMapping<T> = Partial<Record<keyof BaseRecord<T>, string>>

export type TransformFn<T extends BaseFields> = (item: T) => Promise<T>
