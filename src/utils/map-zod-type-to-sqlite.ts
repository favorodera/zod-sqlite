import type { SQLiteSupportType, SQLiteType } from '../types'
import * as zod from 'zod/v4/core'

export function mapZodTypeToSQLite(zodType: zod.$ZodTypes['_zod']['def']['type'], schema: zod.$ZodType): SQLiteType | SQLiteSupportType {
  switch (zodType) {

    case 'string':{

      const format = (schema as zod.$ZodStringFormat)._zod.def.format as zod.$ZodStringFormats

      switch (format) {
        case 'date':
          return 'DATE'

        case 'datetime':
          return 'DATETIME'
        
        case 'duration':
          return 'INTEGER'
      
        default:
          return 'TEXT'
      }

    }

    case 'date':
      return 'DATE'

    case 'enum':
    case 'literal':
    case 'template_literal':
    case 'array':
    case 'object':
      return 'TEXT'

    case 'number':{
      const format = (schema as zod.$ZodNumberFormat)._zod.def.format

      switch (format) {
        case 'safeint':
        case 'uint32':
        case 'int32':
          return 'INTEGER'

        case 'float32':
        case 'float64':
          return 'FLOAT'

        default:
          return 'REAL'
      }
    }

    case 'boolean':
      return 'BOOLEAN'

    case 'bigint':
      return 'BIGINT'

    case 'null':
    case 'undefined':
      return 'NULL'

    case 'file':
      return 'BLOB'

    default:
      return 'TEXT'
  }
}
