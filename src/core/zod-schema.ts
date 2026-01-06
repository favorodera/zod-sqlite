import type { ColumnConfig } from '../types'
import * as zod from 'zod/v4/core'
import { z } from 'zod'

export function buildZodSchema<TColumns extends readonly ColumnConfig<string, zod.$ZodType>[]>(columns: TColumns) {
  const schemaShape: Record<string, zod.$ZodType> = {}
  
  for (const column of columns) {
    schemaShape[column.name] = column.schema
  }
  
  type SchemaType = {
    [K in TColumns[number]['name']]: Extract<TColumns[number], { name: K }>['schema']
  }

  return z.object(schemaShape) as z.ZodObject<SchemaType>
}
