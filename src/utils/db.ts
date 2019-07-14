import {airtable} from './airtable'

interface Options {
  max?: number
  view?: string
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

  constructor(base: any, tableName: string, options: Options) {
    this.tableName = tableName
    this.table = base(tableName)
    this.options = options
  }

  async find(view?: string) {
    if (!view && this.options.view) view = this.options.view
    if (!view) throw new Error(`The table's view must be specified.`)

    return listData(this.table, view)
  }
}

export function listData(Table: any, view: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Table.select({view}).all((err: Error, records: any[]) => {
      if (err) return reject(err)
      const list = records.map(r => ({
        id: r.id,
        createdAt: r._rawJson.createdTime,
        ...r.fields,
      }))
      resolve(list)
    })
  })
}
