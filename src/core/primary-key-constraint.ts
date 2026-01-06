export function buildPrimaryKeyConstraint(primaryKeys: string[]): string {
  if (primaryKeys.length === 0) return ''
  return `PRIMARY KEY (${primaryKeys.join(', ')})`
}
