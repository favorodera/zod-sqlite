import type { SQLiteSupportType, SQLiteType } from '../types'

export function formatDefaultValue(value: unknown, SQLiteType: SQLiteType | SQLiteSupportType) {
  switch (SQLiteType) {
    case 'TEXT':
      return `DEFAULT '${String(value).replace(/'/g, "''")}'`
      
    case 'INTEGER':
    case 'REAL':
      return `DEFAULT ${Number(value)}`

    case 'NULL':
      return 'DEFAULT NULL'
  
    default:
      return `DEFAULT '${value}'`
  }
}
