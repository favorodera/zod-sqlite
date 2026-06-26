import type * as zod from 'zod/v4/core'
import { z } from 'zod'
import type { ColumnConfig } from './types'

/**
 * Builds a Zod schema from column definitions.
 *
 * Creates a Zod object schema where keys are column names and values are
 * the corresponding Zod schemas from the column configuration.
 * @template TColumns - Array of column configurations
 * @param columns Array of column configurations
 * @returns Zod object schema
 */
export function buildZodSchema<TColumns extends ReadonlyArray<ColumnConfig<string, zod.$ZodType>>>(columns: TColumns) {
  const schemaShape: Record<string, zod.$ZodType> = {}

  for (const column of columns) {
    schemaShape[column.name] = column.schema
  }

  type SchemaType = {
    [K in TColumns[number]['name']]: Extract<TColumns[number], { name: K }>['schema']
  }

  return z.object(schemaShape) as z.ZodObject<SchemaType>
}
