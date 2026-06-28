'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
interface ProjectOption {
  id: string;
  title: string;
}
interface SeasonOption {
  id: string;
  label: string;
}
interface ProposalDetailsFormProps {
  title: string;
  onTitle: (v: string) => void;
  season: string;
  onSeason: (v: string) => void;
  styleSummary: string;
  onStyleSummary: (v: string) => void;
  seasons: SeasonOption[];
  projectId?: string;
  onProjectId?: (v: string) => void;
  projects?: ProjectOption[];
}
export function ProposalDetailsForm({
  title,
  onTitle,
  season,
  onSeason,
  styleSummary,
  onStyleSummary,
  seasons,
  projectId,
  onProjectId,
  projects,
}: ProposalDetailsFormProps) {
  return (
    <div className="space-y-3 border-b border-portal-border bg-portal-surface p-4">
      {projects && onProjectId && (
        <div className="space-y-1">
          <Label className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Project</Label>
          <Select value={projectId} onValueChange={onProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Collection title</Label>
          <Input
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="e.g. Summer Lace Edit"
          />
        </div>
        <div className="space-y-1">
          <Label className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Season</Label>
          <Select value={season} onValueChange={onSeason}>
            <SelectTrigger>
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.label}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Style summary</Label>
        <Textarea
          rows={2}
          value={styleSummary}
          onChange={(e) => onStyleSummary(e.target.value)}
          placeholder="Collection direction for the customer…"
        />
      </div>
    </div>
  );
}
