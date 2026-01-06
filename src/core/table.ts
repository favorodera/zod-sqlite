import { buildColumnDefinition } from './column-definitions'
import { buildIndexStatements } from './index-statements'
import { buildPrimaryKeyConstraint } from './primary-key-constraint'
import type { ColumnConfig, TableConfig } from '../types'
import { buildZodSchema } from './zod-schema'

/**
 * Creates a table definition and Zod schema.
 *
 * This function is the main entry point for defining a table. It takes a configuration object
 * and returns:
 * 1. `table`: SQL CREATE TABLE statement
 * 2. `indexes`: Array of SQL CREATE INDEX statements
 * 3. `schema`: Zod object schema matching the table structure
 *
 * @param config - Table configuration object
 * @returns Object containing SQL statements and Zod schema
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTable<const TColumns extends readonly ColumnConfig<any, any>[]>(config: TableConfig<TColumns>) {
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
    table: createTableSQL,
    indexes: createIndexesSQL,
    schema: zodSchema,
  }
}
