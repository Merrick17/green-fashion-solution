/**
 * Pure shared constants consumed by both `apps/api` and `apps/web`.
 *
 * These are inert string values only — no logic, no framework imports, no side
 * effects (per the `packages/` rule in CLAUDE.md). Anything auth-flow specific
 * (cookie names, TTLs) lives per-app, not here.
 */

/**
 * WebSocket event names emitted by the API gateway and listened for on the web
 * client. Centralized so the two sides cannot drift.
 */
export const WS_EVENTS = {
  NOTIFICATION: 'notification',
  PROPOSAL_UPDATED: 'proposal:updated',
  MEETING_UPDATED: 'meeting:updated',
  PROJECT_STATUS: 'project:status',
} as const;

export type WsEventName = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];

/**
 * Query-param used by the projects endpoint (and AI nest client) to request a
 * revision-mode read. Shared so the controller and the clients agree on the key.
 */
export const REVISION_MODE_PARAM = 'revisionMode' as const;