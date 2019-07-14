import Airtable from 'db'
import {promisify} from 'util'

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

  tableName: string
  options: Options = {}

  _get: Function

  constructor(base: any, tableName: string, options: Options) {
    this.tableName = tableName
    this.table = base(tableName)
    this.options = options

    this._get = promisify(this.table.find)
  }

  async find(view?: string) {
    if (!view && this.options.view) view = this.options.view
    if (!view) throw new Error(`The table's view must be specified.`)

    return listData(this.table, view)
  }

  async get(id: string) {
    const record = await this._get(id)

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
