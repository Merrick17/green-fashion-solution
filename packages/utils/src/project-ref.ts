export function toProjectRef(projectId: string): string {
  return `PRJ-${projectId.slice(-6).toUpperCase()}`;
}
