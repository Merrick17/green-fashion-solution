/**
 * Title-case a raw enum / snake_case string for display.
 * "PRODUCT_DEVELOPMENT" -> "Product Development", "IN_REVIEW" -> "In Review",
 * "UNDER_10K" -> "Under 10k".
 *
 * Co-located admin helper (pure function, no side effects) so the record
 * screens avoid duplicating the `.replace(/_/g, " ")` pattern across pages.
 */
export function titleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
