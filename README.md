<div align="center">
  <h1>Zod-SQLite</h1>
  <p><strong>Generate type-safe SQLite table schemas from Zod validation schemas. Define your database structure once using Zod, and automatically generate both SQL CREATE TABLE statements and runtime validation schemas with full TypeScript type inference.</strong></p>
  <p>
    <a href="https://github.com/favorodera/zod-sqlite/blob/main/LICENSE"><img src="https://img.shields.io/github/license/favorodera/zod-sqlite.svg?style=plastic&label=License&color=blue" alt="License"></a>
    <a href="https://github.com/favorodera/zod-sqlite/stargazers"><img src="https://img.shields.io/github/stars/favorodera/zod-sqlite.svg?style=plastic&label=Stars&color=blue" alt="GitHub Stars"></a>
    <a href="https://npmx.dev/package/zod-sqlite"><img src="https://img.shields.io/npm/dt/zod-sqlite.svg?style=plastic&label=NPM%20Downloads&color=blue" alt="NPM Downloads"></a>
    <a href="https://npmx.dev/package/zod-sqlite"><img src="https://img.shields.io/npm/v/zod-sqlite.svg?style=plastic&label=Version&color=blue" alt="NPM Version"></a>
  </p>
</div>

<br>

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Type Mappings](#type-mappings)
- [Column Configuration](#column-configuration)
- [Constraints and Validation](#constraints-and-validation)
- [Primary Keys](#primary-keys)
- [Foreign Keys and Relationships](#foreign-keys-and-relationships)
- [Indexes](#indexes)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [Limitations](#limitations)

## Overview

This tool bridges the gap between Zod schemas and SQLite database definitions. Instead of maintaining separate validation logic and database schemas, define your table structure once using Zod, and get:

- Syntactically correct SQL CREATE TABLE statements
- Appropriate indexes for query optimization
- Zod schemas for runtime validation
- Full TypeScript type inference
- Automatic CHECK constraints from Zod validation rules

### Key Features

- **Type Safety**: Full TypeScript support with automatic type inference from Zod schemas
- **Single Source of Truth**: Define your schema once, use it everywhere
- **Comprehensive Validation**: Automatic CHECK constraints for enums, literals, and numeric ranges
- **Relationship Support**: Foreign key constraints with cascade actions
- **Index Management**: Support for standard, unique, and partial indexes
- **SQLite Compliance**: Generates valid SQLite 3 SQL statements

## Installation

```bash
npm install zod-sqlite
```

## Quick Start

Here's a simple example creating a users table:

```typescript
import { z } from 'zod'
import { createTable } from 'zod-sqlite'

const users = createTable({
  columns: [
    { name: 'id', schema: z.int() },
    { name: 'email', schema: z.email() },
    { name: 'username', schema: z.string().min(3)
      .max(20) },
    { name: 'created_at', schema: z.date().default(new Date()) },
  ],
  indexes: [{ columns: ['email'], name: 'idx_users_email', unique: true }],
  name: 'users',
  primaryKeys: ['id'],
})

// Use the generated SQL
console.log(users.table)
// CREATE TABLE users (
//   id INTEGER NOT NULL,
//   email TEXT NOT NULL,
//   username TEXT NOT NULL CHECK(length(username) >= 3 AND length(username) <= 20),
//   created_at DATE NOT NULL DEFAULT '2026-01-06T...',
//   PRIMARY KEY (id)
// );

console.log(users.indexes[0])
// CREATE UNIQUE INDEX idx_users_email ON users (email);

// Validate data at runtime
const result = users.schema.safeParse({
  created_at: new Date(),
  email: 'user@example.com',
  id: 1,
  username: 'john',
})

// TypeScript type inference
type User = z.infer<typeof users.schema>
// { id: number; email: string; username: string; created_at: Date }
```

## Core Concepts

### Schema-Driven Design

Zod schemas serve as the source of truth for your database structure. Each column is defined with a Zod schema that serves dual purposes:

1. **Database Level**: Determines the SQLite column type (TEXT, INTEGER, REAL, BLOB, NULL)
2. **Application Level**: Provides runtime validation and TypeScript type inference

### The createTable Function

`createTable` is the primary entry point. It accepts a configuration object and returns three things:

```typescript
const result = createTable(config)
// Returns: { table: string, indexes: string[], schema: ZodObject }
```

- `table`: A SQL CREATE TABLE statement ready to execute
- `indexes`: An array of SQL CREATE INDEX statements
- `schema`: A Zod object schema for data validation

### Column Definition Flow

1. Define columns with Zod schemas
2. Each schema is analyzed to determine SQLite type
3. Metadata is extracted (nullable, default values, constraints)
4. Appropriate SQL column definitions are generated
5. CHECK constraints are created from Zod validation rules

## API Reference

### createTable(config)

Creates a table definition with SQL statements and validation schema.

**Parameters:**

- `config`: `TableConfig` - Table configuration object

**Returns:**

```
{
  table: string        // CREATE TABLE SQL statement
  indexes: string[]    // Array of CREATE INDEX statements
  schema: ZodObject    // Zod validation schema
}
```

**Example:**

```typescript
const { indexes, schema, table } = createTable({
  columns: [
    { name: 'id', schema: z.int() },
    { name: 'name', schema: z.string() },
    { name: 'price', schema: z.number().min(0) },
  ],
  name: 'products',
  primaryKeys: ['id'],
})
```

### TableConfig

Configuration object for table creation.

```typescript
interface TableConfig {
  columns: Array<ColumnConfig> // Array of column definitions
  indexes?: Array<IndexConfig> // Optional index configurations
  name: string // Table name
  primaryKeys: Array<string> // Column names forming primary key
}
```

### ColumnConfig

Configuration for a single column.

```typescript
interface ColumnConfig {
  name: string // Column name
  references?: ForeignKeyReference // Foreign key configuration
  schema: ZodType // Zod schema defining type and validation
  unique?: boolean // Whether values must be unique
}
```

### ForeignKeyReference

Foreign key constraint configuration.

```typescript
interface ForeignKeyReference {
  column: string // Referenced column name
  onDelete?: ForeignKeyAction // Action on parent deletion
  onUpdate?: ForeignKeyAction // Action on parent update
  table: string // Referenced table name
}

type ForeignKeyAction
  = | 'CASCADE'
    | 'NO ACTION'
    | 'RESTRICT'
    | 'SET DEFAULT'
    | 'SET NULL'
```

### IndexConfig

Index configuration for query optimization.

```typescript
interface IndexConfig {
  columns: Array<string> // Indexed column names
  name: string // Index name
  unique?: boolean // Whether this is a unique index
  where?: string // Optional WHERE clause for partial index
}
```

## Type Mappings

Zod types map to SQLite column types as follows:

### Text Types

| Zod Schema | SQLite Type |
|------------|-------------|
| `z.string()` | TEXT |
| `z.enum(['a', 'b'])` | TEXT |
| `z.literal('value')` | TEXT |
| `z.date()` | DATE |
| `z.iso.datetime()` | DATETIME |
| `z.array()` | TEXT |
| `z.object()` | TEXT |

### Numeric Types

| Zod Schema | SQLite Type |
|------------|-------------|
| `z.number()` | REAL |
| `z.int()` | INTEGER |
| `z.int32()` | INTEGER |
| `z.uint32()` | INTEGER |
| `z.safeint()` | INTEGER |
| `z.float32()` | FLOAT |
| `z.float64()` | FLOAT |

### Other Types

| Zod Schema | SQLite Type |
|------------|-------------|
| `z.boolean()` | BOOLEAN (stored as 0/1) |
| `z.bigint()` | BIGINT |
| `z.date()` | DATE |
| `z.file()` | BLOB |
| `z.null()` | NULL |
| `z.undefined()` | NULL |

### Type Wrappers

These Zod wrappers are automatically unwrapped:

- `.optional()` - Makes column nullable
- `.nullable()` - Makes column nullable  
- `.default(value)` - Adds DEFAULT clause

```typescript
z.string().optional() // TEXT (nullable)
z.number().default(0) // REAL NOT NULL DEFAULT 0
z.string().nullable()
  .default('n/a') // TEXT DEFAULT 'n/a'
```

## Column Configuration

### Basic Columns

```
{ name: 'email', schema: z.email() }
// SQL: email TEXT NOT NULL
```

### Optional and Nullable Columns

```
{ name: 'bio', schema: z.string().optional() }
// SQL: bio TEXT

{ name: 'middle_name', schema: z.string().nullable() }
// SQL: middle_name TEXT
```

### Columns with Default Values

```
{ name: 'status', schema: z.enum(['active', 'inactive']).default('active') }
// SQL: status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive'))

{ name: 'count', schema: z.int().default(0) }
// SQL: count INTEGER NOT NULL DEFAULT 0
```

### Unique Columns

```
{ name: 'username', schema: z.string(), unique: true }
// SQL: username TEXT NOT NULL UNIQUE
```

## Constraints and Validation

SQL CHECK constraints are automatically generated from Zod validation rules.

### Enum Constraints

```
{ 
  name: 'role', 
  schema: z.enum(['admin', 'user', 'guest']) 
}
// SQL: role TEXT NOT NULL CHECK(role IN ('admin', 'user', 'guest'))
```

### Literal Constraints

```
{ 
  name: 'type', 
  schema: z.literal('premium') 
}
// SQL: type TEXT NOT NULL CHECK(type = 'premium')

{
  name: 'category',
  schema: z.union([
    z.literal('electronics'),
    z.literal('clothing'),
    z.literal('food')
  ])
}
// SQL: category TEXT NOT NULL CHECK(category IN ('electronics', 'clothing', 'food'))
```

### Numeric Range Constraints

```
{ 
  name: 'age', 
  schema: z.int().min(18).max(120) 
}
// SQL: age INTEGER NOT NULL CHECK(age >= 18 AND age <= 120)

{
  name: 'price',
  schema: z.number().min(0)
}
// SQL: price REAL NOT NULL CHECK(price >= 0)
```

### String Length Constraints

```
{ 
  name: 'username', 
  schema: z.string().min(3).max(20) 
}
// SQL: username TEXT NOT NULL CHECK(length(username) >= 3 AND length(username) <= 20)

{
  name: 'code',
  schema: z.string().length(6)
}
// SQL: code TEXT NOT NULL CHECK(length(code) = 6)
```

## Primary Keys

### Single Column Primary Key

The most common pattern for entity tables:

```typescript
createTable({
  columns: [
    { name: 'id', schema: z.int() },
    { name: 'email', schema: z.string() },
  ],
  name: 'users',
  primaryKeys: ['id'],
})
// SQL: PRIMARY KEY (id)
```

### Composite Primary Key

Used for junction tables and multi-tenant data:

```typescript
createTable({
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
// SQL: PRIMARY KEY (user_id, role_id)
```

### Multi-Tenant Example

```typescript
createTable({
  columns: [
    { name: 'tenant_id', schema: z.string() },
    { name: 'doc_id', schema: z.int() },
    { name: 'title', schema: z.string() },
  ],
  name: 'documents',
  primaryKeys: [
    'tenant_id',
    'doc_id',
  ],
})
// SQL: PRIMARY KEY (tenant_id, doc_id)
```

## Foreign Keys and Relationships

### Basic Foreign Key

```typescript
createTable({
  columns: [
    { name: 'id', schema: z.int() },
    {
      name: 'author_id',
      references: {
        column: 'id',
        table: 'users',
      },
      schema: z.int(),
    },
  ],
  name: 'posts',
  primaryKeys: ['id'],
})
// SQL: author_id INTEGER NOT NULL REFERENCES users(id)
```

### Cascade Delete

Automatically delete child records when parent is deleted:

```
{
  name: 'user_id',
  schema: z.int(),
  references: {
    table: 'users',
    column: 'id',
    onDelete: 'CASCADE'
  }
}
// SQL: user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
```

### Restrict Delete

Prevent deletion of parent if children exist:

```
{
  name: 'category_id',
  schema: z.int(),
  references: {
    table: 'categories',
    column: 'id',
    onDelete: 'RESTRICT'
  }
}
// SQL: category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT
```

### Set Null on Delete

Set foreign key to NULL when parent is deleted:

```
{
  name: 'manager_id',
  schema: z.int().nullable(),
  references: {
    table: 'employees',
    column: 'id',
    onDelete: 'SET NULL'
  }
}
// SQL: manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL
```

### Update Cascade

Propagate updates to child records:

```
{
  name: 'parent_id',
  schema: z.int(),
  references: {
    table: 'categories',
    column: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}
// SQL: parent_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
```

## Indexes

### Simple Index

```
indexes: [
  {
    columns: ['email'],
    name: 'idx_users_email',
  },
]
// SQL: CREATE INDEX idx_users_email ON users (email);
```

### Unique Index

Enforce uniqueness at the database level:

```typescript
indexes: [
  {
    columns: ['username'],
    name: 'idx_users_username',
    unique: true,
  },
]
// SQL: CREATE UNIQUE INDEX idx_users_username ON users (username);
```

### Composite Index

Index multiple columns together for multi-column queries:

```typescript
indexes: [
  {
    columns: [
      'author_id',
      'created_at',
    ],
    name: 'idx_posts_author_date',
  },
]
// SQL: CREATE INDEX idx_posts_author_date ON posts (author_id, created_at);
```

Benefits queries like:
```sql
SELECT * FROM posts WHERE author_id = 123 ORDER BY created_at DESC;
SELECT * FROM posts WHERE author_id = 123 AND created_at > '2024-01-01';
```

### Partial Index

Index only rows matching a condition:

```typescript
indexes: [
  {
    columns: ['last_login'],
    name: 'idx_active_users',
    where: 'deleted_at IS NULL',
  },
]
// SQL: CREATE INDEX idx_active_users ON posts (last_login) WHERE deleted_at IS NULL;
```

Benefits:
- Smaller index size
- Faster updates to non-matching rows
- Optimized for filtered queries

## Advanced Usage

### Complete Blog Example

```typescript
// Users table
const users = createTable({
  columns: [
    { name: 'id', schema: z.int() },
    { name: 'email', schema: z.email(), unique: true },
    { name: 'username', schema: z.string().min(3)
      .max(20), unique: true },
    { name: 'role', schema: z.enum([
      'admin',
      'author',
      'reader',
    ]).default('reader') },
    { name: 'created_at', schema: z.date().default(new Date()) },
  ],
  indexes: [
    { columns: ['email'], name: 'idx_users_email', unique: true },
    { columns: ['role'], name: 'idx_users_role' },
  ],
  name: 'users',
  primaryKeys: ['id'],
})

// Posts table with foreign key
const posts = createTable({
  columns: [
    { name: 'id', schema: z.int() },
    { name: 'title', schema: z.string().min(1)
      .max(200) },
    { name: 'content', schema: z.string() },
    { name: 'status', schema: z.enum([
      'draft',
      'published',
      'archived',
    ]).default('draft') },
    {
      name: 'author_id',
      references: {
        column: 'id',
        onDelete: 'CASCADE',
        table: 'users',
      },
      schema: z.int(),
    },
    { name: 'published_at', schema: z.date().nullable() },
    { name: 'created_at', schema: z.date().default(new Date()) },
  ],
  indexes: [
    { columns: ['author_id'], name: 'idx_posts_author' },
    {
      columns: ['published_at'],
      name: 'idx_posts_published',
      where: 'status = \'published\'',
    },
    { columns: [
      'status',
      'created_at',
    ], name: 'idx_posts_status_date' },
  ],
  name: 'posts',
  primaryKeys: ['id'],
})

// Junction table for tags (many-to-many)
const postTags = createTable({
  columns: [
    {
      name: 'post_id',
      references: {
        column: 'id',
        onDelete: 'CASCADE',
        table: 'posts',
      },
      schema: z.int(),
    },
    {
      name: 'tag_id',
      references: {
        column: 'id',
        onDelete: 'CASCADE',
        table: 'tags',
      },
      schema: z.int(),
    },
    { name: 'created_at', schema: z.date().default(new Date()) },
  ],
  name: 'post_tags',
  primaryKeys: [
    'post_id',
    'tag_id',
  ],
})
```

### E-commerce Example

```typescript
const products = createTable({
  columns: [
    { name: 'id', schema: z.int() },
    { name: 'sku', schema: z.string().length(10), unique: true },
    { name: 'name', schema: z.string().min(1) },
    { name: 'description', schema: z.string().optional() },
    { name: 'price', schema: z.number().min(0) },
    { name: 'stock', schema: z.int().min(0)
      .default(0) },
    { name: 'active', schema: z.boolean().default(true) },
    {
      name: 'category_id',
      references: {
        column: 'id',
        onDelete: 'RESTRICT',
        table: 'categories',
      },
      schema: z.int(),
    },
  ],
  indexes: [
    { columns: ['sku'], name: 'idx_products_sku', unique: true },
    { columns: ['category_id'], name: 'idx_products_category' },
    {
      columns: [
        'price',
        'stock',
      ],
      name: 'idx_products_active',
      where: 'active = 1',
    },
  ],
  name: 'products',
  primaryKeys: ['id'],
})
```

### Self-Referencing Table

```typescript
const employees = createTable({
  columns: [
    { name: 'id', schema: z.int() },
    { name: 'name', schema: z.string() },
    { name: 'email', schema: z.email(), unique: true },
    {
      name: 'manager_id',
      references: {
        column: 'id',
        onDelete: 'SET NULL',
        table: 'employees',
      },
      schema: z.int().nullable(),
    },
  ],
  indexes: [{ columns: ['manager_id'], name: 'idx_employees_manager' }],
  name: 'employees',
  primaryKeys: ['id'],
})
```

## Best Practices

### Schema Design

1. **Always define primary keys**: Every table should have a primary key for reliable row identification.

2. **Use appropriate types**: Choose the most specific Zod type that matches your data:
   ```typescript
   z.int() // For IDs and counts
   z.number().min(0) // For prices and quantities
   z.enum([
     'a',
     'b',
   ]) // For status fields
   z.email() // For email addresses
   ```

3. **Add validation at the schema level**: Leverage Zod's validation to prevent invalid data:
   ```typescript
   z.string().min(3)
     .max(50) // Username length
   z.number().min(0)
     .max(5) // Rating scale
   ```

### Foreign Keys

1. **Always reference primary keys**: Foreign keys should point to primary key or unique columns.

2. **Choose appropriate cascade actions**:
   - Use `CASCADE` for child records that don't make sense without parent
   - Use `RESTRICT` to prevent accidental deletion of referenced data
   - Use `SET NULL` when relationship is optional

3. **Enable foreign key enforcement** in SQLite:
   ```sql
   PRAGMA foreign_keys = ON;
   ```

### Indexes

1. **Index foreign keys**: Always create indexes on foreign key columns for JOIN performance.

2. **Index frequently queried columns**: Add indexes to columns used in WHERE clauses.

3. **Use composite indexes wisely**: Order matters - most selective column first:
   ```typescript
   indexes: [
     // Good: Filters by tenant first (high selectivity)
     { columns: [
       'tenant_id',
       'user_id',
     ], name: 'idx_tenant_user' },
   ]
   ```

4. **Consider partial indexes**: Reduce index size for filtered queries:
   ```typescript
   indexes: [
     {
       columns: ['created_at'],
       name: 'idx_active_records',
       where: 'deleted_at IS NULL', // Only index active records
     },
   ]
   ```

5. **Don't over-index**: Each index slows down writes. Only add indexes that improve query performance.

### Naming Conventions

1. **Tables**: Use plural nouns in snake_case
   - `users`, `blog_posts`, `order_items`

2. **Columns**: Use snake_case
   - `user_id`, `created_at`, `first_name`

3. **Indexes**: Use descriptive names with `idx_` prefix
   - `idx_users_email`, `idx_posts_author_date`

4. **Foreign keys**: Name with `_id` suffix
   - `author_id`, `category_id`, `parent_id`

### Type Safety

1. **Use type inference**: Let TypeScript infer types from your schema:
   ```typescript
   const { schema } = createTable(config)
   type User = z.infer<typeof schema>
   ```

2. **Validate at boundaries**: Use the generated schema to validate external data:
   ```typescript
   const result = users.schema.safeParse(inputData)
   if (!result.success) {
     console.error(result.error)
   }
   ```

## Limitations

### Composite Foreign Keys (By Design)

Single-column foreign keys are supported at the column level. Composite foreign keys require table-level constraints that reference multiple tables, which is outside the scope of single-table schema generation.

**Why this is intentional:** `createTable` generates schema for one table at a time. Composite foreign keys are cross-table relationships that should be managed explicitly by developers as part of overall database design.

**Pattern for composite foreign keys:**

```typescript
// 1. Create parent table with composite primary key
const { table: ordersTable } = createTable({
  columns: [
    { name: 'tenant_id', schema: z.string() },
    { name: 'order_id', schema: z.int() },
    { name: 'total', schema: z.number() },
  ],
  name: 'orders',
  primaryKeys: [
    'tenant_id',
    'order_id',
  ],
})

// 2. Create child table with matching columns
const { table: itemsTable } = createTable({
  columns: [
    { name: 'id', schema: z.int() },
    { name: 'tenant_id', schema: z.string() },
    { name: 'order_id', schema: z.int() },
    { name: 'product', schema: z.string() },
  ],
  name: 'order_items',
  primaryKeys: ['id'],
})

// 3. Execute table creation
db.exec(ordersTable)
db.exec(itemsTable)

// 4. Add composite foreign key constraint
db.exec(`
  ALTER TABLE order_items 
  ADD CONSTRAINT fk_order 
  FOREIGN KEY (tenant_id, order_id) 
  REFERENCES orders(tenant_id, order_id)
  ON DELETE CASCADE
`)
```

### Complex CHECK Constraints

Only specific Zod validations generate CHECK constraints:
- **Enums and literals**: `z.enum(['a', 'b'])`, `z.literal('value')`
- **Numeric ranges**: `.min()`, `.max()` on numbers
- **String length**: `.min()`, `.max()`, `.length()` on strings

Custom refinements and complex validations work at the application level but don't generate SQL constraints:

```
{ 
  name: 'email', 
  schema: z.string().refine(val => val.includes('@'), 'Must contain @')
}
// ✅ Runtime validation works
// ❌ No CHECK constraint in SQL
// Still stored as: email TEXT NOT NULL
```

**Why:** SQL CHECK constraints are limited compared to JavaScript validation. Complex rules should be validated in application code using the generated Zod schema.

### Array and Object Storage

Arrays and objects are stored as TEXT with JSON serialization. You must handle serialization manually:

```
{ name: 'tags', schema: z.array(z.string()) }
// SQL: tags TEXT NOT NULL

// You need to handle:
const data = { tags: ['tech', 'news'] }
db.exec(`INSERT INTO posts (tags) VALUES (?)`, [JSON.stringify(data.tags)])

const result = db.query(`SELECT tags FROM posts`)
const tags = JSON.parse(result.tags) // ['tech', 'news']
```

**Recommendation:** For better queryability, consider separate tables for array data:
```typescript
// Instead of storing tags as JSON array
// Use a junction table: post_tags (post_id, tag_id)
```

### Date Handling

Dates are stored as TEXT in ISO 8601 format. SQLite doesn't have a native DATE type:

```
{ name: 'created_at', schema: z.date() }
// SQL: created_at DATE NOT NULL
// Stored as TEXT: '2026-01-07T12:30:00.000Z'
```

**Querying dates:** Use SQLite's date functions:
```sql
-- Filter by date
SELECT * FROM posts WHERE date(created_at) = '2026-01-07'

-- Date arithmetic
SELECT * FROM posts WHERE date(created_at) > date('now', '-7 days')

-- Extract parts
SELECT strftime('%Y', created_at) as year FROM posts
```

### No Migration Support

This library generates CREATE TABLE statements for initial schema definition. It does not:
- Track schema changes over time
- Generate ALTER TABLE migrations
- Handle data migrations
- Manage version history

### SQLite-Specific Features

This tool is designed specifically for SQLite. Some features may not translate to other databases:

| Feature | SQLite Behavior | Other Databases |
|---------|----------------|-----------------|
| Type System | Dynamic type affinity | Strict typing (PostgreSQL, MySQL) |
| Boolean Storage | 0/1 integers | True BOOLEAN type |
| Date Storage | TEXT in ISO 8601 | Native DATE/TIMESTAMP types |
| CHECK Constraints | Fully supported | Varies by database |
| Foreign Keys | Optional (needs PRAGMA) | Usually enforced by default |

**Portability:** If you need multi-database support, consider an ORM like Prisma or TypeORM instead.

### Foreign Key Enforcement

**Critical:** SQLite does not enforce foreign key constraints by default. You must enable them:

```typescript
// Example using db0
const db = createDatabase(sqlite({
  name: './db.sqlite',
}))

// Enable for each database connection
db.exec('PRAGMA foreign_keys = ON')
```

Without this pragma:
- Foreign key constraints are ignored
- No referential integrity checks
- Data can become inconsistent

**Always enable this in production** to maintain data integrity.

---

For issues, feature requests, or contributions, please visit the project repository.