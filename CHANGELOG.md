# zod-sqlite

## v1.0.2...v1.0.3

[compare changes](https://github.com/favorodera/zod-sqlite/compare/v1.0.2...v1.0.3)

### Added

- **core:** Add buildColumnDefinition utility ([b6b137a](https://github.com/favorodera/zod-sqlite/commit/b6b137a))

  - Implement SQL column definition builder
  - Support constraints, defaults, and foreign keys
  - Integrate zod schema to SQLite type mapping

- **sql:** Add index statement generator ([ba23ccc](https://github.com/favorodera/zod-sqlite/commit/ba23ccc))

  - implement buildIndexStatements function
  - support unique and partial index generation

- **sql:** Add buildPrimaryKeyConstraint utility ([c2be007](https://github.com/favorodera/zod-sqlite/commit/c2be007))

  - Implement function for primary key SQL generation
  - Support single and composite primary keys

- **table:** Implement createTable utility ([3699c61](https://github.com/favorodera/zod-sqlite/commit/3699c61))

  - add createTable function
  - generate SQL table and index statements
  - derive Zod schema from column configuration

- **types:** Add database schema definition types ([319d963](https://github.com/favorodera/zod-sqlite/commit/319d963))

  - Define SQLite storage and support types
  - Add interfaces for columns, indexes, and tables
  - Include foreign key and primary key configurations
  - Integrate Zod schema support for validation

- **schema:** Add buildZodSchema utility ([720280d](https://github.com/favorodera/zod-sqlite/commit/720280d))

  - Implement dynamic Zod schema builder
  - Map column configurations to Zod object
  - Add type-safe schema generation


### Refactors

- **core:** Update createTable import path ([ce590bd](https://github.com/favorodera/zod-sqlite/commit/ce590bd))

  - update import path for createTable
  - cleanup whitespace in index.ts

- **utils:** Improve formatCheckConstraint readability ([5466bdc](https://github.com/favorodera/zod-sqlite/commit/5466bdc))

  - replace replace with replaceAll
  - update return types to use undefined
  - add missing eslint disable for loop
  - format code for consistency

- **utils:** Improve formatDefaultValue logic ([1150b02](https://github.com/favorodera/zod-sqlite/commit/1150b02))

  - add curly braces to switch cases
  - replace global string replace with replaceAll
  - simplify boolean conversion logic
  - update JSDoc formatting

- **utils:** Improve zodToSQLite type safety and formatting ([f78195b](https://github.com/favorodera/zod-sqlite/commit/f78195b))

  - Import zod as a type-only import
  - Clean up variable initialization
  - Standardize JSDoc formatting
  - Reorder return object properties


### Documentation

- **community:** Add contributor code of conduct ([b8ea4bf](https://github.com/favorodera/zod-sqlite/commit/b8ea4bf))

  - adopt contributor covenant v2.0
  - establish community behavior standards
  - define enforcement and reporting guidelines

- **contributing:** Add contribution guidelines ([e749a4c](https://github.com/favorodera/zod-sqlite/commit/e749a4c))
- **README:** Reformat code examples and interfaces ([2bb8a41](https://github.com/favorodera/zod-sqlite/commit/2bb8a41))
- **readme:** Improve project documentation and badges ([9858a9e](https://github.com/favorodera/zod-sqlite/commit/9858a9e))

  - Add project badges for license, stars, and npm
  - Improve visual layout with header container
  - Clean up whitespace and formatting
  - Update README content for better readability


### Chores

- **config:** Add .editorconfig for consistency ([6cdbf8c](https://github.com/favorodera/zod-sqlite/commit/6cdbf8c))

  - set standard indentation to 2 spaces
  - enforce consistent line endings and charset
  - configure whitespace trimming rules

- **git:** Add .gitattributes for line endings ([c561a4c](https://github.com/favorodera/zod-sqlite/commit/c561a4c))

  - configure git to use lf line endings automatically

- **gitignore:** Update and standardize ignore rules ([c0fbf2e](https://github.com/favorodera/zod-sqlite/commit/c0fbf2e))

  - add support for common build and log directories
  - include environment and editor configuration patterns
  - group rules by category for better maintainability

- **eslint:** Migrate config to @favorodera/eslint-config ([c1d0515](https://github.com/favorodera/zod-sqlite/commit/c1d0515))

  - remove eslint.config.mjs
  - add eslint.config.ts
  - adopt factory-based configuration
  - customize project-specific rules

- **config:** Refactor typescript configuration ([9af143d](https://github.com/favorodera/zod-sqlite/commit/9af143d))

  - Update target to esnext and lib to es2023
  - Simplify compiler options for bundler usage
  - Update include path to src directory

- **build:** Migrate from tsup to tsdown ([8a46256](https://github.com/favorodera/zod-sqlite/commit/8a46256))

  - remove tsup configuration
  - add tsdown configuration

- **test:** Simplify vitest configuration ([a019d9d](https://github.com/favorodera/zod-sqlite/commit/a019d9d))

  - remove unnecessary reporters and projects
  - set testTimeout to 0

- **ci:** Setup project automation and workflows ([5aef798](https://github.com/favorodera/zod-sqlite/commit/5aef798))

  - Add issue and PR templates
  - Configure CI pipeline for linting and testing
  - Implement manual release workflow with Relizy
  - Add renovate dependency management
  - Clean up unused funding platforms

- **core:** Remove database schema generation package ([e8df10e](https://github.com/favorodera/zod-sqlite/commit/e8df10e))

  - Delete core logic for SQL and Zod schema generation
  - Remove all associated unit and integration tests
  - Remove type definitions for SQLite schema configuration


### Styling

- **utils:** Reformat switch-case in mapZodTypeToSQLite ([e918a3e](https://github.com/favorodera/zod-sqlite/commit/e918a3e))

  - add missing braces to switch blocks
  - enable perfectionist sort for switch cases
  - clean up function signature formatting

### ❤️ Contributors

- Favour Emeka ([@favorodera](https://github.com/favorodera))


## 1.0.2

### Patch Changes

- cc3153e: make IndexConfig generic for type-safe column names

## 1.0.1

### Patch Changes

- Fix workflows

## 1.0.0

### Patch Changes

- Fix workflows

## 1.0.0

### Major Changes

- 8fc8cb4: v1

## 1.0.0-alpha.2

### Major Changes

- 8fc8cb4: v1
