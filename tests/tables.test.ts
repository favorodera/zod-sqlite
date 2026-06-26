import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createTable } from '../src'

describe('table Generation', () => {
  it('should generate a simple table with correct SQL', () => {
    const { table } = createTable({
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'email', schema: z.email() },
      ],
      name: 'users',
      primaryKeys: ['id'],
    })

    expect(table).toBe(`CREATE TABLE users (
  id INTEGER NOT NULL,
  email TEXT NOT NULL,
  PRIMARY KEY (id)
);`)
  })

  it('should handle complex column types and constraints', () => {
    const { table } = createTable({
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'name', schema: z.string().min(3) },
        { name: 'price', schema: z.number().min(0) },
        { name: 'active', schema: z.boolean().default(true) },
        { name: 'tags', schema: z.string().array(), unique: true },
      ],
      name: 'products',
      primaryKeys: ['id'],
    })

    expect(table).toContain('CREATE TABLE products')
    expect(table).toContain('id INTEGER NOT NULL')
    expect(table).toContain('name TEXT NOT NULL CHECK(length(name) >= 3)')
    expect(table).toContain('price REAL NOT NULL CHECK(price >= 0)')
    expect(table).toContain('active BOOLEAN NOT NULL DEFAULT 1')
    // eslint-disable-next-line test/max-expects
    expect(table).toContain('tags TEXT NOT NULL UNIQUE')
    // eslint-disable-next-line test/max-expects
    expect(table).toContain('PRIMARY KEY (id)')
  })

  it('should handle nullable and optional columns', () => {
    const { table } = createTable({
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'message', schema: z.string().optional() },
        { name: 'meta', schema: z.string().nullable() },
      ],
      name: 'logs',
      primaryKeys: ['id'],
    })

    expect(table).toContain('message TEXT')
    expect(table).not.toContain('message TEXT NOT NULL')
    expect(table).toContain('meta TEXT')
    expect(table).not.toContain('meta TEXT NOT NULL')
  })

  it('should generate composite primary keys', () => {
    const { table } = createTable({
      columns: [
        { name: 'user_id', schema: z.int() },
        { name: 'role_id', schema: z.int() },
      ],
      name: 'user_roles',
      primaryKeys: [
        'user_id',
        'role_id',
      ],
    })

    expect(table).toContain('PRIMARY KEY (user_id, role_id)')
  })

  it('should generate foreign keys', () => {
    const { table } = createTable({
      columns: [
        { name: 'id', schema: z.int() },
        {
          name: 'user_id',
          references: {
            column: 'id',
            onDelete: 'CASCADE',
            table: 'users',
          },
          schema: z.int(),
        },
      ],
      name: 'posts',
      primaryKeys: ['id'],
    })

    expect(table).toContain('user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE')
  })
})
