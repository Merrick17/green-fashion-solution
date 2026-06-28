import type { ProjectStatus } from "@repo/types";

export function projectStatusToJourneyStep(status: ProjectStatus): string {
  switch (status) {
    case "DRAFT":
    case "SUBMITTED":
      return "intake";
    case "IN_REVIEW":
    case "SOURCING":
      return "sourcing";
    case "PROPOSAL_READY":
      return "proposal";
    case "SAMPLING":
      return "sampling";
    case "PRODUCTION":
    case "COMPLETED":
      return "production";
    default:
      return "intake";
  }
}
