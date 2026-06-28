import { ProjectStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.DRAFT]: [ProjectStatus.SUBMITTED, ProjectStatus.CANCELLED],
  [ProjectStatus.SUBMITTED]: [ProjectStatus.IN_REVIEW, ProjectStatus.CANCELLED],
  [ProjectStatus.IN_REVIEW]: [ProjectStatus.SOURCING, ProjectStatus.CANCELLED],
  [ProjectStatus.SOURCING]: [ProjectStatus.PROPOSAL_READY, ProjectStatus.CANCELLED],
  [ProjectStatus.PROPOSAL_READY]: [ProjectStatus.SAMPLING, ProjectStatus.SOURCING, ProjectStatus.CANCELLED],
  [ProjectStatus.SAMPLING]: [ProjectStatus.PRODUCTION, ProjectStatus.CANCELLED],
  [ProjectStatus.PRODUCTION]: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
  [ProjectStatus.COMPLETED]: [],
  [ProjectStatus.CANCELLED]: [],
};

export function assertValidProjectTransition(from: ProjectStatus, to: ProjectStatus): void {
  if (from === to) return;
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new BadRequestException(`Cannot transition project from ${from} to ${to}`);
  }
}

export const PROJECT_LIFECYCLE_ORDER: ProjectStatus[] = [
  ProjectStatus.DRAFT,
  ProjectStatus.SUBMITTED,
  ProjectStatus.IN_REVIEW,
  ProjectStatus.SOURCING,
  ProjectStatus.PROPOSAL_READY,
  ProjectStatus.SAMPLING,
  ProjectStatus.PRODUCTION,
  ProjectStatus.COMPLETED,
];
