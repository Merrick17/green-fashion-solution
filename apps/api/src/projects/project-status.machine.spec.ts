import { BadRequestException } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { assertValidProjectTransition, PROJECT_LIFECYCLE_ORDER } from './project-status.machine';

describe('assertValidProjectTransition', () => {
  // ── Valid forward transitions ──────────────────────────────────────────────

  it('allows DRAFT → SUBMITTED', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.DRAFT, ProjectStatus.SUBMITTED)).not.toThrow();
  });

  it('allows DRAFT → CANCELLED', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.DRAFT, ProjectStatus.CANCELLED)).not.toThrow();
  });

  it('allows SUBMITTED → IN_REVIEW', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.SUBMITTED, ProjectStatus.IN_REVIEW)).not.toThrow();
  });

  it('allows SUBMITTED → CANCELLED', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.SUBMITTED, ProjectStatus.CANCELLED)).not.toThrow();
  });

  it('allows IN_REVIEW → SOURCING', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.IN_REVIEW, ProjectStatus.SOURCING)).not.toThrow();
  });

  it('allows IN_REVIEW → CANCELLED', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.IN_REVIEW, ProjectStatus.CANCELLED)).not.toThrow();
  });

  it('allows SOURCING → PROPOSAL_READY', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.SOURCING, ProjectStatus.PROPOSAL_READY)).not.toThrow();
  });

  it('allows SOURCING → CANCELLED', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.SOURCING, ProjectStatus.CANCELLED)).not.toThrow();
  });

  it('allows PROPOSAL_READY → SAMPLING', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.PROPOSAL_READY, ProjectStatus.SAMPLING)).not.toThrow();
  });

  it('allows PROPOSAL_READY → SOURCING (back to sourcing for revisions)', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.PROPOSAL_READY, ProjectStatus.SOURCING)).not.toThrow();
  });

  it('allows PROPOSAL_READY → CANCELLED', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.PROPOSAL_READY, ProjectStatus.CANCELLED)).not.toThrow();
  });

  it('allows SAMPLING → PRODUCTION', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.SAMPLING, ProjectStatus.PRODUCTION)).not.toThrow();
  });

  it('allows SAMPLING → CANCELLED', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.SAMPLING, ProjectStatus.CANCELLED)).not.toThrow();
  });

  it('allows PRODUCTION → COMPLETED', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.PRODUCTION, ProjectStatus.COMPLETED)).not.toThrow();
  });

  it('allows PRODUCTION → CANCELLED', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.PRODUCTION, ProjectStatus.CANCELLED)).not.toThrow();
  });

  // ── Same-status transitions are no-ops ────────────────────────────────────

  it('allows same-status (DRAFT → DRAFT) without throwing', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.DRAFT, ProjectStatus.DRAFT)).not.toThrow();
  });

  it('allows same-status (COMPLETED → COMPLETED) without throwing', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.COMPLETED, ProjectStatus.COMPLETED)).not.toThrow();
  });

  // ── Invalid transitions ───────────────────────────────────────────────────

  it('throws BadRequestException for DRAFT → IN_REVIEW (skipping SUBMITTED)', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.DRAFT, ProjectStatus.IN_REVIEW))
      .toThrow(BadRequestException);
  });

  it('throws BadRequestException for DRAFT → COMPLETED', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.DRAFT, ProjectStatus.COMPLETED))
      .toThrow(BadRequestException);
  });

  it('throws BadRequestException for SUBMITTED → SOURCING (skipping IN_REVIEW)', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.SUBMITTED, ProjectStatus.SOURCING))
      .toThrow(BadRequestException);
  });

  it('throws BadRequestException for IN_REVIEW → PROPOSAL_READY (skipping SOURCING)', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.IN_REVIEW, ProjectStatus.PROPOSAL_READY))
      .toThrow(BadRequestException);
  });

  it('throws BadRequestException for COMPLETED → DRAFT (no going back from terminal)', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.COMPLETED, ProjectStatus.DRAFT))
      .toThrow(BadRequestException);
  });

  it('throws BadRequestException for CANCELLED → any status', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.CANCELLED, ProjectStatus.DRAFT))
      .toThrow(BadRequestException);
    expect(() => assertValidProjectTransition(ProjectStatus.CANCELLED, ProjectStatus.SUBMITTED))
      .toThrow(BadRequestException);
  });

  it('throws BadRequestException for PRODUCTION → SOURCING (no backward jump)', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.PRODUCTION, ProjectStatus.SOURCING))
      .toThrow(BadRequestException);
  });

  it('throws error with message containing the from/to status names', () => {
    expect(() => assertValidProjectTransition(ProjectStatus.DRAFT, ProjectStatus.COMPLETED))
      .toThrow(/DRAFT.*COMPLETED|Cannot transition/);
  });
});

describe('PROJECT_LIFECYCLE_ORDER', () => {
  it('contains all non-terminal statuses in the correct order', () => {
    expect(PROJECT_LIFECYCLE_ORDER).toEqual([
      ProjectStatus.DRAFT,
      ProjectStatus.SUBMITTED,
      ProjectStatus.IN_REVIEW,
      ProjectStatus.SOURCING,
      ProjectStatus.PROPOSAL_READY,
      ProjectStatus.SAMPLING,
      ProjectStatus.PRODUCTION,
      ProjectStatus.COMPLETED,
    ]);
  });

  it('does not include CANCELLED', () => {
    expect(PROJECT_LIFECYCLE_ORDER).not.toContain(ProjectStatus.CANCELLED);
  });
});
