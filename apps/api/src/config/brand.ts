/**
 * Brand identity constants used across email templates, the Swagger title,
 * email subject prefixes, and the PDF footer.
 */
export const BRAND = {
  NAME: 'Green Fashion Solution',
  /** Suffix appended to the brand name on internal (designer/admin) emails. */
  INTERNAL_SUFFIX: ' — Internal',
  /** Prefixed to outbound email subjects. */
  EMAIL_SUBJECT_PREFIX: '[Green Fashion Solution] ',
  /** PDF footer tagline. */
  TAGLINE: 'your partner in fashion sourcing and supply chain execution.',
} as const;