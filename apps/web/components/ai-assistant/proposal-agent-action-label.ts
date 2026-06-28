import type { ProposalAgentAction } from '@/hooks/use-proposal-ai';

export function proposalAgentActionLabel(
  action: ProposalAgentAction,
): string | null {
  if (action.type === 'preview' && action.payload && typeof action.payload === 'object') {
    const slideCount = (action.payload as { slideCount?: number }).slideCount;
    return slideCount != null ? `Deck preview: ${slideCount} slides` : 'Deck preview ready';
  }
  if (action.type === 'export' && action.payload && typeof action.payload === 'object') {
    const path = (action.payload as { downloadPath?: string }).downloadPath;
    return path ? 'Export ready — use Download below' : 'Export generated';
  }
  if (action.type === 'saved' && action.payload && typeof action.payload === 'object') {
    const id = (action.payload as { id?: string }).id;
    return id ? `Draft saved (${id.slice(0, 8)})` : 'Draft saved';
  }
  if (action.type === 'task') return 'Sourcing task assigned';
  return null;
}
