import { formatCheckConstraint } from '../utils/format-check-constraint'
import { formatDefaultValue } from '../utils/format-default-value'
import type { TableConfig } from '../types'
import { zodToSQLite } from '../utils/zod-to-sqlite'

/**
 * Builds the SQL definition for a single column.
 *
 * Combines name, type, and constraints into a valid SQL column string.
 *
 * @param column - Column configuration object
 * @returns Complete column definition string (e.g., "id INTEGER NOT NULL")
 */
export function buildColumnDefinition(column: TableConfig['columns'][number]): string {
  const { name, schema, unique, references } = column
  const { SQLiteType, nullable, defaultValue } = zodToSQLite(schema)

  const parts: string[] = [name, SQLiteType]

  // Add constraints
  if (!nullable) parts.push('NOT NULL')
  if (defaultValue !== undefined) parts.push(formatDefaultValue(defaultValue, SQLiteType))
  if (unique) parts.push('UNIQUE')

  // Add CHECK constraint for enums/literals
  const checkConstraint = formatCheckConstraint(name, schema)
  if (checkConstraint) parts.push(checkConstraint)

  // Add foreign key
  if (references) {
    const { table, column: refColumn, onDelete, onUpdate } = references
    parts.push(`REFERENCES ${table}(${refColumn})`)
    if (onDelete) parts.push(`ON DELETE ${onDelete}`)
    if (onUpdate) parts.push(`ON UPDATE ${onUpdate}`)
  }

  return parts.join(' ')
}
