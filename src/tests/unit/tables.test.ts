import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createTable } from '../../index'

describe('Table Generation', () => {

  it('should generate a simple table with correct SQL', () => {
    const { table } = createTable({
      name: 'users',
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'email', schema: z.email() },
      ],
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
      name: 'products',
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'name', schema: z.string().min(3) },
        { name: 'price', schema: z.number().min(0) },
        { name: 'active', schema: z.boolean().default(true) },
        { name: 'tags', schema: z.string().array(), unique: true },
      ],
      primaryKeys: ['id'],
    })

    expect(table).toContain('CREATE TABLE products')
    expect(table).toContain('id INTEGER NOT NULL')
    expect(table).toContain('name TEXT NOT NULL CHECK(length(name) >= 3)')
    expect(table).toContain('price REAL NOT NULL CHECK(price >= 0)')
    expect(table).toContain('active BOOLEAN NOT NULL DEFAULT 1')
    expect(table).toContain('tags TEXT NOT NULL UNIQUE')
    expect(table).toContain('PRIMARY KEY (id)')
  })

  it('should handle nullable and optional columns', () => {
    const { table } = createTable({
      name: 'logs',
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'message', schema: z.string().optional() },
        { name: 'meta', schema: z.string().nullable() },
      ],
      primaryKeys: ['id'],
    })

    expect(table).toContain('message TEXT')
    expect(table).not.toContain('message TEXT NOT NULL')
    expect(table).toContain('meta TEXT')
    expect(table).not.toContain('meta TEXT NOT NULL')
  })

  it('should handle nullable and optional columns', () => {
    const { table } = createTable({
      name: 'logs',
      columns: [
        { name: 'id', schema: z.int() },
        { name: 'message', schema: z.string().optional() },
        { name: 'meta', schema: z.string().nullable() },
      ],
      primaryKeys: ['id'],
    })

    expect(table).toContain('message TEXT')
    expect(table).not.toContain('message TEXT NOT NULL')
    expect(table).toContain('meta TEXT')
    expect(table).not.toContain('meta TEXT NOT NULL')
  })

  it('should generate composite primary keys', () => {
    const { table } = createTable({
      name: 'user_roles',
      columns: [
        { name: 'user_id', schema: z.int() },
        { name: 'role_id', schema: z.int() },
      ],
      primaryKeys: ['user_id', 'role_id'],
    })

    expect(table).toContain('PRIMARY KEY (user_id, role_id)')
  })

  it('should generate foreign keys', () => {
    const { table } = createTable({
      name: 'posts',
      columns: [
        { name: 'id', schema: z.int() },
        {
          name: 'user_id',
          schema: z.int(),
          references: {
            table: 'users',
            column: 'id',
            onDelete: 'CASCADE',
          },
        },
      ],
      primaryKeys: ['id'],
    })

    expect(table).toContain(
      'user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE',
    )
  })

})
