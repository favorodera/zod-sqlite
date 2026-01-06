/**
 * Builds the PRIMARY KEY constraint string.
 *
 * Handles both single-column and composite primary keys.
 *
 * @param primaryKeys - Array of column names forming the primary key
 * @returns SQL constraint string (e.g., "PRIMARY KEY (id, email)")
 */
export function buildPrimaryKeyConstraint(primaryKeys: string[] | readonly string[]): string {
  if (primaryKeys.length === 0) return ''
  return `PRIMARY KEY (${primaryKeys.join(', ')})`
}
