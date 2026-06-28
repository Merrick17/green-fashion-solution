'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { SectionCard } from '@/components/shared/section-card';
import {
  useMessageThreads,
  useCreateMessageThread,
} from '@/hooks/use-messages';
import { useProjects } from '@/hooks/use-projects';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { useActiveProject } from '@/hooks/use-active-project';
import { formatDateTime } from '@repo/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Plus } from 'lucide-react';
const dropdownParams = { page: 1, limit: 100 };
export default function CustomerMessagesPage() {
  const router = useRouter();
  const { setPage, params } = usePagination(20);
  const { data, isLoading, isError, refetch } = useMessageThreads(params);
  const { data: projectsData } = useProjects(dropdownParams);
  const { projectId: activeProjectId, setProjectId } = useActiveProject();
  const createThread = useCreateMessageThread();
  const [composing, setComposing] = useState(false);
  const [projectId, setLocalProjectId] = useState(activeProjectId ?? '');
  const [body, setBody] = useState('');
  const threads = data?.data ?? [];
  const projects = projectsData?.data ?? [];
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    createThread.mutate(
      { projectId: projectId || undefined, body: body.trim() },
      {
        onSuccess: (thread) => {
          setBody('');
          setComposing(false);
          router.push(`/customer/messages/${thread.id}`);
        },
      },
    );
  };
  return (
    <AppPage>
      <PageHeader
        title="Messages"
        description="Communicate with your sourcing team — admin replies on your project threads"
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => setComposing((v) => !v)}
          >
            <Plus className="mr-2 h-4 w-4" /> New message
          </Button>
        }
      />
      {composing && (
        <SectionCard title="Start a conversation">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Project (optional)</Label>
              <Select
                value={projectId}
                onValueChange={(value) => {
                  setLocalProjectId(value);
                  setProjectId(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="General inquiry" />
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
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Ask about your project, proposal, or sampling timeline…"
                rows={4}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!body.trim() || createThread.isPending}
              >
                {createThread.isPending ? 'Sending…' : 'Send'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setComposing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SectionCard>
      )}
      <EntityList
        items={threads}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        loadingVariant="rows"
        emptyTitle="No messages yet"
        emptyDescription="Start a conversation with your sourcing team."
        renderItem={(thread) => {
          const preview = thread.messages?.[0]?.body ?? 'No messages';
          const projectTitle = thread.projectId
            ? (projects.find((p) => p.id === thread.projectId)?.title ??
              'Project')
            : 'General';
          return (
            <Link
              key={thread.id}
              href={`/customer/messages/${thread.id}`}
              className="flex items-start gap-3 border border-portal-border bg-portal-surface p-4 transition-colors hover:bg-muted"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-secondary">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {projectTitle}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {preview}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatDateTime(thread.updatedAt)}
                </p>
              </div>
            </Link>
          );
        }}
        className="space-y-2"
      />
      {!isLoading && threads.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
