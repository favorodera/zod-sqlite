import type { TableConfig } from '../types'

export function buildIndexStatements(tableName: string, indexes?: TableConfig['indexes']): string[] {
  if (!indexes || indexes.length === 0) return []
  
  return indexes.map((index) => {
    const uniqueClause = index.unique ? 'UNIQUE ' : ''
    const whereClause = index.where ? ` WHERE ${index.where}` : ''
    return `CREATE ${uniqueClause}INDEX ${index.name} ON ${tableName} (${index.columns.join(', ')})${whereClause};`
  })
}
