// Re-export all types for public API
export type {
  SQLiteType,
  ForeignKeyAction,
  IndexConfig,
  ColumnConfig,
  TableConfig,
} from './types'

// Re-export converter classes and factory function
export { createTable } from './utils/converter'
