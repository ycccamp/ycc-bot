import Airtable, {FieldSet} from 'airtable'

import {promisify} from 'util'
import {debug} from 'utils/logs'

import {Store, BaseRecord, BaseFields, Options} from './types'
import {MultiCache} from './multi-cache'

const {AIRTABLE_API_KEY} = process.env

export const airtable = new Airtable({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY,
})

function mapRecord<T>({id, _rawJson, fields}: any): BaseRecord<T> {
  return {
    id: id,
    createdAt: new Date(_rawJson.createdTime),
    ...fields,
  }
}

export function Database(baseID: string) {
  return function createTable<T extends BaseFields>(tableName: string, options: Options<T> = {}) {
    const base = airtable.base(baseID)

    return new Table<T>(base, tableName, options)
  }
}

export class Table<T extends BaseFields> {
  table: Airtable.Table<T & FieldSet>
  cache: Store<any>

  name: string
  options: Options<T> = {}

  _fields: Record<string, keyof T> = {}

  _get: Function
  _update: Function
  _create: Function
  _destroy: Function

  constructor(base: any, name: string, options: Options<T>) {
    this.name = name
    this.table = base(name)
    this.cache = new MultiCache({name, strategy: 'hybrid'})

    if (this.options) {
      this.options = options
    }

    if (options.fields) {
      this._fields = Object.entries(options.fields).map(([k, v]) => ({[String(v)]: k})).reduce((a, b) => ({...a, ...b})) as Record<string, keyof T>
    }

    this._get = promisify(this.table.find)
    this._update = promisify(this.table.update)
    this._create = promisify(this.table.create)
    this._destroy = promisify(this.table.destroy)
  }

  _transform = async (item: any): Promise<T> => {
    const {fields, transform} = this.options

    let record: T = {} as T
    item = mapRecord<T>(item)

    if (fields) {
      for (let originalKey in item) {
        const newKey = this._fields[originalKey]

        const value = item[originalKey]
        const key = (newKey || originalKey) as keyof BaseRecord<T>

        record[key] = value
      }
    }

    if (transform) {
      record = await transform(record)
    }

    return record
  }

  async sync(view?: string) {
    const list = await this.find(view)

    await this.cache.clear()
    await this.cache.setAll(list)
  }

  async find(view?: string): Promise<T[]> {
    if (!view && this.options.view) view = this.options.view
    if (!view) throw new Error(`The table's view must be specified.`)

    const cached = await this.cache.list()

    if (cached && cached.length > 0) {
      debug(`Using Cached Data: ${this.name} (${cached.length} records)\n`)

      return cached
    }

    let data = await listData(this.table, view)
    data = await Promise.all(data.map(this._transform))

    await this.cache.setAll(data)

    debug(`Using Direct Data: ${this.name} (${data.length} records)\n`)

    return data
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const record = await this._update(id, data)
    const r = await this._transform(record)

    await this.cache.set(r.id, r)

    return r
  }

  async create(data: T): Promise<T> {
    const record = await this._create(data)
    const r = await this._transform(record)

    await this.cache.set(r.id, r)

    return r
  }

  async remove(id: string) {
    await this._destroy(id)
    await this.cache.delete(id)

    return id
  }

  async get(id: string): Promise<T> {
    const cached = await this.cache.get(id)

    if (cached) {
      debug(`Using Cached Data: ${this.name} (id = ${id})`)

      return cached
    }

    const record = await this._get(id)
    await this.cache.set(id, record)

    debug(`Using Direct Data: ${this.name} (id = ${id})`)

    return this._transform(record)
  }
}

export function listData(Table: any, view: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Table.select({view}).all((err: Error, records: any[]) => {
      if (err) return reject(err)
      resolve(records)
    })
  })
}
