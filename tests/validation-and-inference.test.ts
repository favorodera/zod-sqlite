import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createTable } from '../src'

describe('zod Schema Inference & Validation', () => {
  it('should infer correct types and validate data', () => {
    const { schema } = createTable({
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'email', schema: z.email() },
        { name: 'age', schema: z.number().min(18)
          .optional() },
      ],
      name: 'users',
      primaryKeys: ['id'],
    })

    // Valid data
    const valid = schema.safeParse({
      age: 25,
      email: 'test@example.com',
      id: 1,
    })

    expect(valid.success).toBe(true)

    // Invalid data (email)
    const invalidEmail = schema.safeParse({
      email: 'not-an-email',
      id: 1,
    })

    expect(invalidEmail.success).toBe(false)
  })

  it('should infer correct TypeScript types', () => {
    const config = {
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'active', schema: z.boolean() },
      ],
      name: 'items',
      primaryKeys: ['id'],
    }

    // eslint-disable-next-line unused-imports/no-unused-vars
    const { schema } = createTable(config)

    type InferredType = z.infer<typeof schema>

    // Type assertion test (checked at compile time, but verifying structure here)
    const item: InferredType = { active: true, id: 1 }

    expect(item.id).toBeTypeOf('number')
    expect(item.active).toBeTypeOf('boolean')
  })
})
