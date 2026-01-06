import * as zod from 'zod/v4/core'
import { mapZodTypeToSQLite } from './map-zod-type-to-sqlite'

/**
 * Analyzes a Zod schema to extract SQLite metadata.
 *
 * Unwraps optional/nullable/default layers to find the underlying core type
 * and extracts metadata like nullability and default values.
 *
 * @param schema - Zod schema to analyze
 * @returns Object containing SQLite type, nullability, default value, and inner schema
 */
export function zodToSQLite(schema: zod.$ZodType) {
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
