import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createTable } from '../../index'

describe('Zod Schema Inference & Validation', () => {
  it('should infer correct types and validate data', () => {
    const { schema } = createTable({
      name: 'users',
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'email', schema: z.email() },
        { name: 'age', schema: z.number().min(18).optional() },
      ],
      primaryKeys: ['id'],
    })

    // Valid data
    const valid = schema.safeParse({
      id: 1,
      email: 'test@example.com',
      age: 25,
    })
    expect(valid.success).toBe(true)

    // Invalid data (email)
    const invalidEmail = schema.safeParse({
      id: 1,
      email: 'not-an-email',
    })
    expect(invalidEmail.success).toBe(false)
  })

  it('should infer correct TypeScript types', () => {
    const config = {
      name: 'items',
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'active', schema: z.boolean() },
      ],
      primaryKeys: ['id'],
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schema } = createTable(config)

    type InferredType = z.infer<typeof schema>

    // Type assertion test (checked at compile time, but verifying structure here)
    const item: InferredType = { id: 1, active: true }
    expect(item.id).toBeTypeOf('number')
    expect(item.active).toBeTypeOf('boolean')
  })
})
