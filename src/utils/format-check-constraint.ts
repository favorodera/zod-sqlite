import type * as zod from 'zod/v4/core'

/**
 * Generates formatted CHECK constraints for validatable columns.
 *
 * Supports:
 * - `z.enum()`: CHECK(col IN ('a', 'b'))
 * - `z.literal()`: CHECK(col = 'val')
 * - `z.number().min/max()`: CHECK(col >= min AND col <= max)
 * - `z.string().min/max()`: CHECK(length(col) >= min)
 * @param name Column name
 * @param schema Zod schema
 * @returns SQL CHECK constraint string or null
 */
export function formatCheckConstraint(name: string, schema: zod.$ZodType) {
  let currentSchema = schema as zod.$ZodTypes

  // Unwrap wrappers
  while (true) {
    const def = currentSchema._zod.def
    // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons
    if (def.type === 'nullable' || def.type === 'optional' || def.type === 'default') {
      currentSchema = def.innerType as zod.$ZodTypes
    } else {
      break
    }
  }

  const definition = currentSchema._zod.def
  const zodType = definition.type

  switch (zodType) {
    case 'enum': {
      const entries = definition.entries
      const values = Object.values(entries)
      const quotedValues = values.map(value => `'${String(value).replaceAll('\'', '\'\'')}'`).join(', ')
      return `CHECK(${name} IN (${quotedValues}))`
    }

    case 'literal': {
      const values = definition.values

      // Single value: CHECK(column = 'value')
      if (values.length === 1) {
        const value = values[0]
        if (typeof value === 'string') {
          return `CHECK(${name} = '${value.replaceAll('\'', '\'\'')}')`
        }
        return `CHECK(${name} = ${value})`
      }

      // Multiple values: CHECK(column IN ('value1', 'value2'))
      const quotedValues = values.map((value) => {
        if (typeof value === 'string') {
          return `'${value.replaceAll('\'', '\'\'')}'`
        }
        return String(value)
      }).join(', ')
      return `CHECK(${name} IN (${quotedValues}))`
    }

    case 'number': {
      const checks = definition.checks
      const constraints: Array<string> = []

      if (!checks) return

      for (const check of checks) {
        const checkParameters = (check as zod.$ZodChecks)._zod.def.check
        const checkValue = (check._zod.def as unknown as { value: number }).value

        switch (checkParameters) {
          case 'greater_than': {
            constraints.push(`${name} >= ${checkValue}`)
            break
          }

          case 'less_than': {
            constraints.push(`${name} <= ${checkValue}`)
            break
          }
        }
      }

      return constraints.length > 0 ? `CHECK(${constraints.join(' AND ')})` : undefined
    }

    case 'string': {
      const checks = definition.checks
      const constraints: Array<string> = []

      if (!checks) return

      for (const check of checks) {
        const checkParameters = (check as zod.$ZodChecks)._zod.def.check
        const checkDefinition = check._zod.def as unknown

        switch (checkParameters) {
          case 'length_equals': {
            constraints.push(`length(${name}) = ${(checkDefinition as { length: number }).length}`)
            break
          }

          case 'max_length': {
            constraints.push(`length(${name}) <= ${(checkDefinition as { maximum: number }).maximum}`)
            break
          }

          case 'min_length': {
            constraints.push(`length(${name}) >= ${(checkDefinition as { minimum: number }).minimum}`)
            break
          }
        }
      }

      return constraints.length > 0 ? `CHECK(${constraints.join(' AND ')})` : undefined
    }

    case 'union': {
      const options = definition.options
      const allAreLiterals = options.every(option => option._zod.def.type === 'literal')

      if (!allAreLiterals) return

      const values: Array<unknown> = []

      for (const option of options) {
        values.push(...(option as zod.$ZodLiteral)._zod.def.values)
      }

      const quotedValues = values.map((value) => {
        if (typeof value === 'string') {
          return `'${value.replaceAll('\'', '\'\'')}'`
        }
        return String(value)
      }).join(', ')
      return `CHECK(${name} IN (${quotedValues}))`
    }
  }
}
