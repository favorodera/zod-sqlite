import * as zod from 'zod/v4/core'

// ============================================================================
// SQLite Column Types
// ============================================================================

/**
 * SQLite native column types.
 *
 * SQLite uses a dynamic type system with these five storage classes.
 * Column values are stored in one of these formats, and SQLite performs
 * type conversions as needed during operations.
 *
 * @see https://www.sqlite.org/datatype3.html#storage_classes_and_datatypes
 */
export type SQLiteType = 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB' | 'NULL'

/**
 * SQLite supported column types.
 *
 * These types are supported by SQLite but not as native storage classes.
 * They are often used as aliases for other types or for specific purposes.
 *
 * @see https://www.sqlite.org/datatype3.html#type_affinity
 */
export type SQLiteSupportType = 'BOOLEAN' | 'BIGINT' | 'DATE' | 'DATETIME' | 'NUMERIC' | 'FLOAT'

// ============================================================================
// Foreign Key Constraints
// ============================================================================

/**
 * Foreign key constraint actions for ON DELETE and ON UPDATE clauses.
 *
 * These actions determine how referential integrity is maintained when
 * parent rows are modified or deleted. They control the cascading behavior
 * of foreign key relationships.
 *
 * **Actions:**
 * - `NO ACTION`: Deferred constraint check (performed after statement completes)
 * - `RESTRICT`: Prevent the operation immediately (fails before any changes)
 * - `SET NULL`: Automatically set foreign key columns to NULL
 * - `SET DEFAULT`: Automatically set foreign key columns to their default values
 * - `CASCADE`: Propagate the DELETE or UPDATE to all child rows
 *
 * **Default behavior**: If not specified, SQLite uses `NO ACTION`
 *
 * @example
 * // Delete a user and all their posts automatically
 * references: {
 *   table: 'users',
 *   column: 'id',
 *   onDelete: 'CASCADE'
 * }
 *
 * @example
 * // Prevent deleting a category that has products
 * references: {
 *   table: 'categories',
 *   column: 'id',
 *   onDelete: 'RESTRICT'
 * }
 *
 * @see https://www.sqlite.org/foreignkeys.html#fk_actions
 */
export type ForeignKeyAction
  = | 'NO ACTION'
    | 'RESTRICT'
    | 'SET NULL'
    | 'SET DEFAULT'
    | 'CASCADE'

/**
 * Foreign key reference configuration.
 *
 * Defines a relationship to another table by referencing one of its columns.
 * This creates a constraint ensuring that values in this column must exist
 * in the referenced table's column (referential integrity).
 *
 * **Important notes:**
 * - The referenced column should typically be a PRIMARY KEY or have a UNIQUE constraint
 * - Foreign key constraints are not enforced by default in SQLite (must enable with PRAGMA)
 * - Composite foreign keys (multiple columns) are defined at the table level, not here
 *
 * @example
 * // Simple foreign key to users table
 * {
 *   table: 'users',
 *   column: 'id',
 *   onDelete: 'CASCADE'
 * }
 *
 * @example
 * // Foreign key with both actions specified
 * {
 *   table: 'categories',
 *   column: 'id',
 *   onDelete: 'SET NULL',
 *   onUpdate: 'CASCADE'
 * }
 */
export type ForeignKeyReference = {
  /**
   * Name of the referenced table.
   *
   * This is the parent table that contains the column being referenced.
   */
  table: string

  /**
   * Name of the referenced column in the parent table.
   *
   * This column should typically be a PRIMARY KEY or have a UNIQUE constraint
   * to ensure the relationship is well-defined.
   */
  column: string

  /**
   * Action to take when the referenced row is deleted.
   *
   * Determines what happens to this row when the parent row is deleted.
   *
   * @default 'NO ACTION'
   */
  onDelete?: ForeignKeyAction

  /**
   * Action to take when the referenced column value is updated.
   *
   * Determines what happens to this foreign key value when the parent
   * column value changes.
   *
   * @default 'NO ACTION'
   */
  onUpdate?: ForeignKeyAction
}

// ============================================================================
// Index Configuration
// ============================================================================

/**
 * Database index configuration.
 *
 * Indexes improve query performance by creating a separate data structure
 * that allows faster lookups on specific columns. They're essential for:
 * - Columns frequently used in WHERE clauses
 * - Columns used in JOIN conditions
 * - Columns used in ORDER BY clauses
 *
 * **Trade-offs:**
 * - **Pros**: Faster SELECT queries, faster JOIN operations
 * - **Cons**: Slower INSERT/UPDATE/DELETE, increased storage size
 *
 * **Best practices:**
 * - Index foreign key columns
 * - Index columns frequently used in WHERE clauses
 * - Consider composite indexes for multi-column queries
 * - Use partial indexes (with WHERE clause) for filtered queries
 *
 * @example
 * // Simple index on email column
 * {
 *   name: 'idx_users_email',
 *   columns: ['email'],
 *   unique: true
 * }
 *
 * @example
 * // Composite index for queries filtering by status and date
 * {
 *   name: 'idx_orders_status_date',
 *   columns: ['status', 'created_at']
 * }
 *
 * @example
 * // Partial index for active users only
 * {
 *   name: 'idx_active_users',
 *   columns: ['username'],
 *   where: 'status = "active"'
 * }
 */
export type IndexConfig = {
  /**
   * Unique name for the index.
   *
   * Used in the CREATE INDEX statement. Convention is to prefix with 'idx_'
   * followed by table name and column names.
   *
   * @example 'idx_users_email'
   * @example 'idx_posts_author_created'
   */
  name: string

  /**
   * Column names to include in the index.
   *
   * For composite indexes, the order matters: queries that filter on the
   * first columns benefit most from the index.
   *
   * @example ['email'] - single column
   * @example ['last_name', 'first_name'] - composite index
   */
  columns: string[]

  /**
   * Whether this is a unique index.
   *
   * When true, enforces uniqueness constraint on the indexed columns.
   * Duplicate values will cause INSERT/UPDATE to fail.
   *
   * **Note**: PRIMARY KEY columns automatically have a unique index.
   *
   * @default false
   */
  unique?: boolean

  /**
   * Optional WHERE clause for a partial index.
   *
   * Only rows matching this condition are included in the index, reducing
   * index size and improving performance for filtered queries.
   *
   * Useful when you frequently query a subset of rows.
   *
   * @example 'deleted_at IS NULL' - index only active records
   * @example 'status = "published"' - index only published content
   * @example 'price > 100' - index only expensive items
   */
  where?: string
}

// ============================================================================
// Column Configuration
// ============================================================================

/**
 * Database column configuration.
 *
 * Defines a single column in a table, including its name, type (via Zod schema),
 * validation rules, and optional constraints like uniqueness and foreign keys.
 *
 * **Column definition workflow:**
 * 1. Zod schema is analyzed to determine SQLite type (TEXT, INTEGER, etc.)
 * 2. Zod schema provides TypeScript type safety and runtime validation
 * 3. Constraints (unique, foreign key) are applied at the database level
 *
 * @example
 * // Simple text column
 * {
 *   name: 'email',
 *   schema: z.string().email()
 * }
 *
 * @example
 * // Unique column with validation
 * {
 *   name: 'username',
 *   schema: z.string().min(3).max(20),
 *   unique: true
 * }
 *
 * @example
 * // Foreign key column
 * {
 *   name: 'author_id',
 *   schema: z.number().int(),
 *   references: {
 *     table: 'users',
 *     column: 'id',
 *     onDelete: 'CASCADE'
 *   }
 * }
 *
 * @example
 * // Optional column with default
 * {
 *   name: 'status',
 *   schema: z.enum(['draft', 'published']).default('draft')
 * }
 */
/**
 * Database column configuration.
 *
 * Defines a single column in a table, including its name, type (via Zod schema),
 * validation rules, and optional constraints like uniqueness and foreign keys.
 *
 * @template TName - Literal string type for the column name
 * @template TSchema - Zod type for the column schema
 */
export type ColumnConfig<TName extends string = string, TSchema extends zod.$ZodType = zod.$ZodType> = {
  /**
   * Name of the column.
   *
   * Used in CREATE TABLE statement and all SQL queries.
   * Should use snake_case by convention.
   *
   * @example 'user_id'
   * @example 'created_at'
   */
  name: TName

  /**
   * Zod schema defining the column's type, validation, and constraints.
   *
   * The Zod schema serves dual purposes:
   * 1. **Database level**: Mapped to SQLite type (TEXT, INTEGER, REAL, BLOB, NULL)
   * 2. **Application level**: Provides TypeScript types and runtime validation
   *
   * **Zod to SQLite type mapping:**
   * - `z.string()`, `z.enum()`, `z.literal()`, `z.date()` → TEXT
   * - `z.number()` → REAL (or INTEGER if `.int()` is used)
   * - `z.bigint()`, `z.boolean()` → INTEGER
   * - `z.custom()` for file/blob → BLOB
   * - `z.null()`, `z.undefined()` → NULL
   *
   * **Zod features mapped to SQL:**
   * - `.optional()`, `.nullable()` → column allows NULL
   * - `.default(value)` → DEFAULT clause in SQL
   * - `.min()`, `.max()`, `.email()`, etc. → runtime validation only
   *
   * @example z.string() - TEXT column
   * @example z.number().int() - INTEGER column
   * @example z.string().nullable() - TEXT column that allows NULL
   * @example z.boolean().default(false) - INTEGER with DEFAULT 0
   */
  schema: TSchema

  /**
   * Whether column values must be unique across all rows.
   *
   * When true, adds a UNIQUE constraint to the column. Any attempt to
   * INSERT or UPDATE a duplicate value will fail.
   *
   * **Note**: This is different from PRIMARY KEY:
   * - UNIQUE columns can be NULL (unless also NOT NULL)
   * - A table can have multiple UNIQUE columns
   * - PRIMARY KEY implies UNIQUE + NOT NULL
   *
   * @default false
   *
   * @example
   * // Unique email address
   * {
   *   name: 'email',
   *   schema: z.string().email(),
   *   unique: true
   * }
   */
  unique?: boolean

  /**
   * Foreign key reference configuration.
   *
   * Creates a constraint linking this column to a column in another table.
   * Ensures referential integrity by preventing orphaned records.
   *
   * **Requirements:**
   * - Referenced column should typically be a PRIMARY KEY or UNIQUE
   * - Types must be compatible between the two columns
   * - Foreign keys must be enabled: `PRAGMA foreign_keys = ON`
   *
   * **Composite foreign keys** (multiple columns referencing multiple columns)
   * cannot be defined here - they must be defined at the table level as a
   * separate constraint.
   *
   * @example
   * {
   *   name: 'user_id',
   *   schema: z.number().int(),
   *   references: {
   *     table: 'users',
   *     column: 'id',
   *     onDelete: 'CASCADE'
   *   }
   * }
   */
  references?: ForeignKeyReference
}

/**
 * Complete database table configuration.
 */
export type TableConfig<
  TColumns extends readonly ColumnConfig<string, zod.$ZodType>[] = readonly ColumnConfig<string, zod.$ZodType>[],
> = {
  /**
   * Name of the table.
   *
   * Used in CREATE TABLE statement and all SQL queries.
   * Should use snake_case by convention (e.g., 'user_profiles', 'order_items').
   *
   * **Naming conventions:**
   * - Use plural nouns for tables representing collections (e.g., 'users', 'posts')
   * - Use singular nouns for junction tables (e.g., 'user_role', 'post_tag')
   * - Avoid SQL reserved keywords (e.g., 'order' → 'orders' or 'user_order')
   *
   * @example 'users'
   * @example 'blog_posts'
   * @example 'user_sessions'
   */
  name: string

  /**
   * Array of column configurations defining the table structure.
   *
   * Each column specifies its name, type (via Zod schema), and optional
   * constraints. The order of columns here determines their order in the
   * CREATE TABLE statement.
   *
   * **Best practices:**
   * - List primary key column(s) first
   * - Group related columns together
   * - Place frequently queried columns earlier
   * - Put large TEXT/BLOB columns last
   *
   * @example
   * [
   *   { name: 'id', schema: z.number().int() },
   *   { name: 'email', schema: z.string().email() },
   *   { name: 'created_at', schema: z.date().default(new Date()) }
   * ]
   */
  columns: TColumns

  /**
   * Column name(s) that form the primary key.
   *
   * The primary key uniquely identifies each row in the table and cannot
   * contain NULL values. Always provided as an array, even for single-column
   * primary keys.
   *
   * **Single column primary key:**
   * - Use an array with one element (e.g., `['id']`)
   * - Typically an auto-incrementing integer
   * - Most common pattern for standard entity tables
   *
   * **Composite primary key:**
   * - Use an array with multiple elements (e.g., `['user_id', 'post_id']`)
   * - Common in junction tables for many-to-many relationships
   * - Order matters: most specific/selective column should come first
   * - The combination of all columns must be unique
   *
   * **Notes:**
   * - Every table should have a primary key
   * - Primary key columns are automatically indexed by SQLite
   * - Primary key implies UNIQUE + NOT NULL constraints on all columns
   * - Cannot be changed after table creation (requires table rebuild)
   *
   * @example ['id'] - single column primary key
   * @example ['user_id', 'role_id'] - composite primary key for junction table
   * @example ['tenant_id', 'record_id'] - composite key for multi-tenant data
   * @example ['country_code', 'postal_code'] - composite key for location data
   */
  primaryKeys: ReadonlyArray<TColumns[number]['name']>

  /**
   * Optional array of index configurations for query optimization.
   *
   * Indexes speed up SELECT queries but slow down INSERT/UPDATE/DELETE
   * operations. Create indexes strategically based on your query patterns.
   *
   * **When to add indexes:**
   * - Foreign key columns (for JOIN performance)
   * - Columns frequently used in WHERE clauses
   * - Columns used in ORDER BY clauses
   * - Columns with high selectivity (many unique values)
   *
   * **When NOT to add indexes:**
   * - Small tables (< 1000 rows) - full table scan is fast enough
   * - Columns with low selectivity (few unique values, like boolean)
   * - Tables with frequent writes and rare reads
   * - Columns rarely used in queries
   *
   * @example
   * [
   *   // Index foreign key for JOIN performance
   *   { name: 'idx_posts_author', columns: ['author_id'] },
   *
   *   // Unique index for lookups
   *   { name: 'idx_users_email', columns: ['email'], unique: true },
   *
   *   // Composite index for multi-column queries
   *   { name: 'idx_posts_status_date', columns: ['status', 'created_at'] },
   *
   *   // Partial index for filtered queries
   *   {
   *     name: 'idx_active_users',
   *     columns: ['last_login'],
   *     where: 'deleted_at IS NULL'
   *   }
   * ]
   */
  indexes?: IndexConfig[]
}
