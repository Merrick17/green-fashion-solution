'use client';
import { FolderKanban } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActiveProject } from '@/hooks/use-active-project';
import { Skeleton } from '@/components/shared/skeleton';
export function ActiveProjectSwitcher() {
  const { projectId, project, projects, isLoading, setProjectId } =
    useActiveProject();
  if (isLoading) {
    return <Skeleton className="hidden h-9 w-44 md:block" />;
  }
  if (projects.length === 0) {
    return null;
  }
  return (
    <Select value={projectId ?? undefined} onValueChange={setProjectId}>
      <SelectTrigger className="hidden h-9 w-44 border-border bg-muted md:flex">
        <div className="flex items-center gap-2 truncate">
          <FolderKanban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="Select project">
            {project?.title ?? 'Select project'}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
