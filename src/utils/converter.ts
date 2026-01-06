import * as zod from 'zod/v4/core'
import { z } from 'zod'
import type {
  SQLiteType,
  TableConfig,
} from '../types'

function mapZodTypeToSQLite(zodType: zod.$ZodTypes['_zod']['def']['type'], schema: zod.$ZodType): SQLiteType {
  switch (zodType) {
    case 'string':
    case 'enum':
    case 'literal':
    case 'template_literal':
    case 'date':
    case 'array':
    case 'object':
      return 'TEXT'

    case 'number':{
      return (schema as zod.$ZodNumber & { isInt: boolean }).isInt ? 'INTEGER' : 'REAL'
    }

    case 'bigint':
    case 'boolean':
      return 'INTEGER'

    case 'null':
    case 'undefined':
      return 'NULL'

    case 'file':
      return 'BLOB'

    default:
      return 'TEXT'
  }
}

function zodToSQLite(schema: zod.$ZodType) {
  let nullable = false
  let defaultValue = undefined
  let currentSchema = schema as zod.$ZodTypes
  // Unwrap wrapped schemas and collect metadata
  while (true) {
    const definition = currentSchema._zod.def
    const zodType = definition.type
    if (zodType === 'nullable' || zodType === 'optional') {
      nullable = true
      currentSchema = definition.innerType as zod.$ZodTypes
    } else if (zodType === 'default') {
      defaultValue = typeof definition.defaultValue === 'function'
        ? definition.defaultValue()
        : definition.defaultValue
      currentSchema = definition.innerType as zod.$ZodTypes
    } else {
      break
    }
  }
  const mainType = currentSchema._zod.def.type
  const SQLiteType = mapZodTypeToSQLite(mainType, currentSchema)
  return { SQLiteType, nullable, defaultValue, schema }
}

function formatDefaultValue(value: unknown, SQLiteType: SQLiteType) {
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

function buildColumnDefinition(column: TableConfig['columns'][number]): string {
  const { name, schema, unique, references } = column
  const { SQLiteType, nullable, defaultValue } = zodToSQLite(schema)
  
  const parts: string[] = [name, SQLiteType]
  
  // Add constraints
  if (!nullable) parts.push('NOT NULL')
  if (defaultValue !== undefined) parts.push(formatDefaultValue(defaultValue, SQLiteType))
  if (unique) parts.push('UNIQUE')
  
  // Add foreign key
  if (references) {
    const { table, column: refColumn, onDelete, onUpdate } = references
    parts.push(`REFERENCES ${table}(${refColumn})`)
    if (onDelete) parts.push(`ON DELETE ${onDelete}`)
    if (onUpdate) parts.push(`ON UPDATE ${onUpdate}`)
  }
  
  return parts.join(' ')
}

function buildPrimaryKeyConstraint(primaryKeys: string[]): string {
  if (primaryKeys.length === 0) return ''
  return `PRIMARY KEY (${primaryKeys.join(', ')})`
}

function buildIndexStatements(tableName: string, indexes?: TableConfig['indexes']): string[] {
  if (!indexes || indexes.length === 0) return []
  
  return indexes.map((index) => {
    const uniqueClause = index.unique ? 'UNIQUE ' : ''
    const whereClause = index.where ? ` WHERE ${index.where}` : ''
    return `CREATE ${uniqueClause}INDEX ${index.name} ON ${tableName} (${index.columns.join(', ')})${whereClause};`
  })
}

function buildZodSchema(columns: TableConfig['columns']) {
  const schemaShape: Record<string, zod.$ZodType> = {}
  
  for (const column of columns) {
    schemaShape[column.name] = column.schema
  }
  
  return z.object(schemaShape)
}

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

// const result = createTable({
//   name: 'users',
//   columns: [
//     { name: 'id', schema: z.number().int() },
//     { name: 'email', schema: z.email() },
//     { name: 'name', schema: z.string().optional() },
//   ],
//   indexes: [
//     { name: 'idx_users_email', columns: ['email'], unique: true },
//   ],
//   primaryKeys: ['id', 'email'],
// })

// // result.schema is z.object({ id: z.number().int(), email: z.string().email(), name: z.string().optional() })
// type User = z.infer<typeof result.schema>
// // { id: number, email: string, name?: string }

// console.log(result.createTable)
