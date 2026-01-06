import type { TableConfig } from '../types'

/**
 * Generates SQL statements for table indexes.
 *
 * Creates standard, unique, and partial indexes based on configuration.
 *
 * @param tableName - Name of the table
 * @param indexes - Array of index configurations
 * @returns Array of CREATE INDEX SQL statements
 */
export function buildIndexStatements(tableName: string, indexes?: TableConfig['indexes']): string[] {
  if (!indexes || indexes.length === 0) return []

  return indexes.map((index) => {
    const uniqueClause = index.unique ? 'UNIQUE ' : ''
    const whereClause = index.where ? ` WHERE ${index.where}` : ''
    return `CREATE ${uniqueClause}INDEX ${index.name} ON ${tableName} (${index.columns.join(', ')})${whereClause};`
  })
}
