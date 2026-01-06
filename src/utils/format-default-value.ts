import type { SQLiteSupportType, SQLiteType } from '../types'

/**
 * Formats a default value for SQL.
 *
 * Handles string quoting and type conversions for DEFAULT clauses.
 *
 * @param value - The default value
 * @param SQLiteType - Target column type
 * @returns Formatted SQL default string (e.g., "DEFAULT 'val'", "DEFAULT 42")
 */
export function formatDefaultValue(value: unknown, SQLiteType: SQLiteType | SQLiteSupportType) {
  switch (SQLiteType) {
    case 'TEXT':
      return `DEFAULT '${String(value).replace(/'/g, "''")}'`

    case 'INTEGER':
    case 'REAL':
      return `DEFAULT ${Number(value)}`

    case 'BOOLEAN':
      return `DEFAULT ${Boolean(value) ? 1 : 0}`

    case 'NULL':
      return 'DEFAULT NULL'

    default:
      return `DEFAULT '${value}'`
  }
}
