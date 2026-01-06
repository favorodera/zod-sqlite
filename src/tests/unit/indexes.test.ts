import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createTable } from '../../index'

describe('Index Generation', () => {
  it('should generate index statements', () => {
    const { indexes } = createTable({
      name: 'users',
      columns: [
        { name: 'id', schema: z.number() },
        { name: 'email', schema: z.email() },
      ],
      primaryKeys: ['id'],
      indexes: [
        { name: 'idx_email', columns: ['email'], unique: true },
      ],
    })

    expect(indexes).toHaveLength(1)
    expect(indexes[0]).toBe('CREATE UNIQUE INDEX idx_email ON users (email);')
  })

  it('should handle partial indexes', () => {
    const { indexes } = createTable({
      name: 'tasks',
      columns: [
        { name: 'id', schema: z.number() },
        { name: 'status', schema: z.string() },
      ],
      primaryKeys: ['id'],
      indexes: [
        {
          name: 'idx_active_tasks',
          columns: ['status'],
          where: "status = 'active'",
        },
      ],
    })

    expect(indexes[0]).toBe(
      "CREATE INDEX idx_active_tasks ON tasks (status) WHERE status = 'active';",
    )
  })
})
