import type { TableConfig } from '../types'
import * as zod from 'zod/v4/core'

export function buildZodSchema(columns: TableConfig['columns']) {
  const schema = new Map<string, zod.$ZodType>()
  
  for (const column of columns) {
    schema.set(column.name, column.schema)
  }
  
  return // TODO: Implement inference
}
