export function buildPrimaryKeyConstraint(primaryKeys: string[] | readonly string[]): string {
  if (primaryKeys.length === 0) return ''
  return `PRIMARY KEY (${primaryKeys.join(', ')})`
}
