import { buildColumnDefinition } from './column-definitions'
import { buildIndexStatements } from './index-statements'
import { buildPrimaryKeyConstraint } from './primary-key-constraint'
import type { TableConfig } from '../types'
import { buildZodSchema } from './zod-schema'

export function createTable(config: TableConfig) {
  const { name, columns, primaryKeys, indexes } = config

  // Build column definitions
  const columnDefs = columns.map(buildColumnDefinition)

  // Build primary key constraint
  const primaryKeyConstraint = buildPrimaryKeyConstraint(primaryKeys)

  // Combine all table elements
  const tableElements = [...columnDefs, primaryKeyConstraint].filter(Boolean)

  // Build CREATE TABLE statement
  const createTableSQL = `CREATE TABLE ${name} (
  ${tableElements.join(',\n  ')}
);`

  // Build CREATE INDEX statements
  const createIndexesSQL = buildIndexStatements(name, indexes)

  // Build Zod schema from columns
  const zodSchema = buildZodSchema(columns)

  return {
    createTable: createTableSQL,
    createIndexes: createIndexesSQL,
    schema: zodSchema,
  }
}
