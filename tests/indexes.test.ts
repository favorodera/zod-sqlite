import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createTable } from '../src'

describe('index Generation', () => {
  it('should generate index statements', () => {
    const { indexes } = createTable({
      columns: [
        { name: 'id', schema: z.number() },
        { name: 'email', schema: z.email() },
      ],
      indexes: [{ columns: ['email'], name: 'idx_email', unique: true }],
      name: 'users',
      primaryKeys: ['id'],
    })

    expect(indexes).toHaveLength(1)
    expect(indexes[0]).toBe('CREATE UNIQUE INDEX idx_email ON users (email);')
  })

  it('should handle partial indexes', () => {
    const { indexes } = createTable({
      columns: [
        { name: 'id', schema: z.number() },
        { name: 'status', schema: z.string() },
      ],
      indexes: [
        {
          columns: ['status'],
          name: 'idx_active_tasks',
          where: 'status = \'active\'',
        },
      ],
      name: 'tasks',
      primaryKeys: ['id'],
    })

    expect(indexes[0]).toBe('CREATE INDEX idx_active_tasks ON tasks (status) WHERE status = \'active\';')
  })
})
