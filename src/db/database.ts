import Airtable from 'airtable'

import {promisify} from 'util'
import {debug} from 'utils/logs'

import {Store} from './types'
import {Fire} from './firestore'
import {MemoryStore} from './mem-store'

const {AIRTABLE_API_KEY} = process.env

export const airtable = new Airtable({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY,
})

interface Options {
  max?: number
  view?: string
}

function mapRecord({id, _rawJson, fields}: any) {
  return {
    id: id,
    createdAt: _rawJson.createdTime,
    ...fields,
  }
}

export const Database = (baseID: string) => (
  tableName: string,
  options: Options = {},
) => {
  const base = airtable.base(baseID)

  return new Table(base, tableName, options)
}

export class Table {
  table: any
  cache: Store<any>

  name: string
  options: Options = {}

  _get: Function
  _update: Function
  _create: Function
  _destroy: Function

  constructor(base: any, name: string, options: Options) {
    this.name = name
    this.table = base(name)
    this.options = options
    this.cache = new MemoryStore(name)

    this._get = promisify(this.table.find)
    this._update = promisify(this.table.update)
    this._create = promisify(this.table.create)
    this._destroy = promisify(this.table.destroy)
  }

  async find(view?: string) {
    if (!view && this.options.view) view = this.options.view
    if (!view) throw new Error(`The table's view must be specified.`)

    const cached = await this.cache.list()

    if (cached && cached.length > 0) {
      debug(`Using Cached Data: ${this.name} (${cached.length} records)`)

      return cached
    }

    const data = await listData(this.table, view)
    await this.cache.setAll(data)

    debug(`Using Direct Data: ${this.name} (${data.length} records)`)

    return data
  }

  async update(id: string, data: any) {
    const record = await this._update(id, data)
    const r = mapRecord(record)

    await this.cache.set(r.id, r)

    return r
  }

  async create(data: any) {
    const record = await this._create(data)
    const r = mapRecord(record)

    await this.cache.set(r.id, r)

    return r
  }

  async remove(id: string) {
    await this._destroy(id)
    await this.cache.delete(id)

    return id
  }

  async get(id: string) {
    const cached = this.cache.get(id)

    if (cached) {
      debug(`Using Cached Data: ${this.name} (id = ${id})`)

      return cached
    }

    const record = await this._get(id)

    debug(`Using Direct Data: ${this.name} (id = ${id})`)

    return mapRecord(record)
  }
}

export function listData(Table: any, view: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Table.select({view}).all((err: Error, records: any[]) => {
      if (err) return reject(err)
      const list = records.map(mapRecord)
      resolve(list)
    })
  })
}
