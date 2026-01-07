import { beforeAll, describe, it, expect } from 'vitest'
import { createDatabase, Database } from 'db0'
import sqlite from 'db0/connectors/node-sqlite'
import { createTable } from '../../index'
import { z } from 'zod'

let db: Database

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    db = createDatabase(sqlite({ name: './tests/db' }))
    
    // Drop all existing tables
    const { rows } = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`

    // Temporarily disable foreign key constraints
    await db.sql`PRAGMA foreign_keys = OFF`
    
    if (rows) {
      for (const table of rows) {
        await db.exec(`DROP TABLE IF EXISTS ${table.name}`)
      }
    }

    // Enable foreign key constraints
    await db.sql`PRAGMA foreign_keys = ON`
  })

  describe('Table Creation with Defaults', () => {
    it('creates table with default values', async () => {
      const { table } = createTable({
        name: 'users',
        columns: [
          { name: 'id', schema: z.number().default(() => Date.now()) },
          { name: 'name', schema: z.string().default('Favour Emeka') },
          { name: 'active', schema: z.boolean().default(true) },
        ],
        primaryKeys: ['id'],
      })

      await db.exec(table)
      await db.sql`INSERT INTO users DEFAULT VALUES`
      
      const { rows } = await db.sql`SELECT * FROM users`
      
      expect(rows).toBeDefined()
      expect(rows).toHaveLength(1)
      expect(rows?.[0].name).toBe('Favour Emeka')
      expect(rows?.[0].active).toBe(1) // SQLite stores boolean as 0/1
      expect(rows?.[0].id).toBeTypeOf('number')
    })
  })

  describe('Primary Keys', () => {
    it('creates table with single primary key', async () => {
      const { table } = createTable({
        name: 'products',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'name', schema: z.string() },
        ],
        primaryKeys: ['id'],
      })

      await db.exec(table)

      // Verify primary key constraint
      await db.sql`INSERT INTO products (id, name) VALUES (1, 'Product 1')`
      
      // Should fail on duplicate primary key
      await expect(async () => {
        await db.sql`INSERT INTO products (id, name) VALUES (1, 'Product 2')`
      }).rejects.toThrow()
    })

    it('creates table with composite primary key', async () => {
      const { table } = createTable({
        name: 'user_roles',
        columns: [
          { name: 'user_id', schema: z.int() },
          { name: 'role_id', schema: z.int() },
          { name: 'assigned_at', schema: z.date().default(new Date()) },
        ],
        primaryKeys: ['user_id', 'role_id'],
      })

      await db.exec(table)

      // Insert valid combination
      await db.sql`INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)`
      await db.sql`INSERT INTO user_roles (user_id, role_id) VALUES (1, 2)`
      await db.sql`INSERT INTO user_roles (user_id, role_id) VALUES (2, 1)`

      // Should fail on duplicate composite key
      await expect(async () => {
        await db.sql`INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)`
      }).rejects.toThrow()

      const { rows } = await db.sql`SELECT * FROM user_roles`
      expect(rows).toHaveLength(3)
    })
  })

  describe('Foreign Keys', () => {
    beforeAll(async () => {
      // Create parent table
      const { table: categoriesTable } = createTable({
        name: 'categories',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'name', schema: z.string() },
        ],
        primaryKeys: ['id'],
      })
      await db.exec(categoriesTable)
      await db.sql`INSERT INTO categories (id, name) VALUES (1, 'Electronics')`
    })

    it('creates foreign key with CASCADE delete', async () => {
      const { table } = createTable({
        name: 'posts',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'title', schema: z.string() },
          {
            name: 'category_id',
            schema: z.int(),
            references: {
              table: 'categories',
              column: 'id',
              onDelete: 'CASCADE',
            },
          },
        ],
        primaryKeys: ['id'],
      })

      await db.exec(table)
      await db.sql`INSERT INTO posts (id, title, category_id) VALUES (1, 'Post 1', 1)`

      // Delete parent - should cascade
      await db.sql`DELETE FROM categories WHERE id = 1`
      
      const { rows } = await db.sql`SELECT * FROM posts WHERE id = 1`
      expect(rows).toHaveLength(0) // Post should be deleted
    })

    it('creates foreign key with RESTRICT delete', async () => {
      // Re-insert category
      await db.sql`INSERT INTO categories (id, name) VALUES (2, 'Books')`

      const { table } = createTable({
        name: 'items',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'name', schema: z.string() },
          {
            name: 'category_id',
            schema: z.int(),
            references: {
              table: 'categories',
              column: 'id',
              onDelete: 'RESTRICT',
            },
          },
        ],
        primaryKeys: ['id'],
      })

      await db.exec(table)
      await db.sql`INSERT INTO items (id, name, category_id) VALUES (1, 'Item 1', 2)`

      // Should fail to delete parent due to RESTRICT
      await expect(async () => {
        await db.sql`DELETE FROM categories WHERE id = 2`
      }).rejects.toThrow()
    })

    it('creates foreign key with SET NULL delete', async () => {
      await db.sql`INSERT INTO categories (id, name) VALUES (3, 'Sports')`

      const { table } = createTable({
        name: 'articles',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'title', schema: z.string() },
          {
            name: 'category_id',
            schema: z.int().nullable(),
            references: {
              table: 'categories',
              column: 'id',
              onDelete: 'SET NULL',
            },
          },
        ],
        primaryKeys: ['id'],
      })

      await db.exec(table)
      await db.sql`INSERT INTO articles (id, title, category_id) VALUES (1, 'Article 1', 3)`

      // Delete parent - should set foreign key to NULL
      await db.sql`DELETE FROM categories WHERE id = 3`
      
      const { rows } = await db.sql`SELECT * FROM articles WHERE id = 1`
      expect(rows?.[0].category_id).toBeNull()
    })

    it('creates foreign key with CASCADE update', async () => {
      await db.sql`INSERT INTO categories (id, name) VALUES (4, 'Fashion')`

      const { table } = createTable({
        name: 'listings',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'title', schema: z.string() },
          {
            name: 'category_id',
            schema: z.int(),
            references: {
              table: 'categories',
              column: 'id',
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
          },
        ],
        primaryKeys: ['id'],
      })

      await db.exec(table)
      await db.sql`INSERT INTO listings (id, title, category_id) VALUES (1, 'Listing 1', 4)`

      // Update parent id - should cascade
      await db.sql`UPDATE categories SET id = 5 WHERE id = 4`
      
      const { rows } = await db.sql`SELECT * FROM listings WHERE id = 1`
      expect(rows?.[0].category_id).toBe(5)
    })
  })

  describe('Indexes', () => {
    it('creates unique index', async () => {
      const { table, indexes } = createTable({
        name: 'accounts',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'email', schema: z.email() },
          { name: 'username', schema: z.string() },
        ],
        primaryKeys: ['id'],
        indexes: [
          { name: 'idx_accounts_email', columns: ['email'], unique: true },
        ],
      })

      await db.exec(table)
      for (const index of indexes) {
        await db.exec(index)
      }

      await db.sql`INSERT INTO accounts (id, email, username) VALUES (1, 'test@example.com', 'user1')`

      // Should fail on duplicate unique index
      await expect(async () => {
        await db.sql`INSERT INTO accounts (id, email, username) VALUES (2, 'test@example.com', 'user2')`
      }).rejects.toThrow()
    })

    it('creates composite index', async () => {
      const { table, indexes } = createTable({
        name: 'orders',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'user_id', schema: z.int() },
          { name: 'status', schema: z.string() },
          { name: 'created_at', schema: z.date().default(new Date()) },
        ],
        primaryKeys: ['id'],
        indexes: [
          { name: 'idx_orders_user_status', columns: ['user_id', 'status'] },
        ],
      })

      await db.exec(table)
      for (const index of indexes) {
        await db.exec(index)
      }

      // Verify index exists
      const { rows } = await db.sql`SELECT name FROM sqlite_master WHERE type='index' AND name='idx_orders_user_status'`
      expect(rows).toHaveLength(1)
    })

    it('creates partial index with WHERE clause', async () => {
      const { table, indexes } = createTable({
        name: 'tasks',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'title', schema: z.string() },
          { name: 'status', schema: z.enum(['pending', 'completed', 'archived']) },
          { name: 'due_date', schema: z.date() },
        ],
        primaryKeys: ['id'],
        indexes: [
          {
            name: 'idx_tasks_pending',
            columns: ['due_date'],
            where: "status = 'pending'",
          },
        ],
      })

      await db.exec(table)
      for (const index of indexes) {
        await db.exec(index)
      }

      // Verify partial index exists
      const { rows } = await db.sql`SELECT sql FROM sqlite_master WHERE type='index' AND name='idx_tasks_pending'`
      expect(rows?.[0].sql).toContain("WHERE status = 'pending'")
    })
  })

  describe('Constraints', () => {
    it('enforces CHECK constraints from Zod validation', async () => {
      const { table } = createTable({
        name: 'employees',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'name', schema: z.string().min(3).max(50) },
          { name: 'age', schema: z.int().min(18).max(65) },
          { name: 'department', schema: z.enum(['HR', 'IT', 'Sales']) },
        ],
        primaryKeys: ['id'],
      })

      await db.exec(table)

      // Valid data
      await db.sql`INSERT INTO employees (id, name, age, department) VALUES (1, 'John Doe', 30, 'IT')`

      // Should fail - age too low
      await expect(async () => {
        await db.sql`INSERT INTO employees (id, name, age, department) VALUES (2, 'Jane', 16, 'HR')`
      }).rejects.toThrow()

      // Should fail - name too short
      await expect(async () => {
        await db.sql`INSERT INTO employees (id, name, age, department) VALUES (3, 'Jo', 25, 'HR')`
      }).rejects.toThrow()

      // Should fail - invalid enum value
      await expect(async () => {
        await db.sql`INSERT INTO employees (id, name, age, department) VALUES (4, 'Bob Smith', 35, 'Marketing')`
      }).rejects.toThrow()
    })

    it('enforces UNIQUE constraints', async () => {
      const { table } = createTable({
        name: 'teams',
        columns: [
          { name: 'id', schema: z.int() },
          { name: 'name', schema: z.string(), unique: true },
          { name: 'code', schema: z.string(), unique: true },
        ],
        primaryKeys: ['id'],
      })

      await db.exec(table)

      await db.sql`INSERT INTO teams (id, name, code) VALUES (1, 'Team A', 'TA')`

      // Should fail on duplicate unique column
      await expect(async () => {
        await db.sql`INSERT INTO teams (id, name, code) VALUES (2, 'Team A', 'TB')`
      }).rejects.toThrow()
    })
  })
})
