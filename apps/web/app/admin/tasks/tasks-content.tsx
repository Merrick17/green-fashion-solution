'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { useCreateTask } from '@/hooks/use-tasks';
import { useUsers } from '@/hooks/use-users';
import { useProjects } from '@/hooks/use-projects';
import { UserRole, BriefType, BriefPriority } from '@repo/types';
import { Button } from '@/components/ui/button';
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
const dropdownParams = { page: 1, limit: 100 };
export function AdminTasksContent() {
  const searchParams = useSearchParams();
  const defaultProject = searchParams.get('projectId') ?? '';
  const { data: usersData } = useUsers(dropdownParams);
  const { data: projectsData } = useProjects(dropdownParams);
  const createTask = useCreateTask();
  const [projectId, setProjectId] = useState(defaultProject);
  const [designerId, setDesignerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [briefType, setBriefType] = useState<BriefType>(
    BriefType.FABRIC_SOURCING,
  );
  const [priority, setPriority] = useState<BriefPriority>(BriefPriority.MEDIUM);
  const [deliverables, setDeliverables] = useState('');
  const users = usersData?.data ?? [];
  const projects = projectsData?.data ?? [];
  const designers = users.filter((u) => u.role === UserRole.DESIGNER);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate({
      projectId,
      designerId,
      title,
      description: description || undefined,
      briefType,
      priority,
      deliverables: deliverables || undefined,
    });
  };
  return (
    <AppPage width="narrow">
      <PageHeader
        title="Assign Brief"
        description="Delegate sourcing work to designers"
      />
      <SectionCard title="Brief details">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
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
          <div className="space-y-2">
            <Label>Designer</Label>
            <Select value={designerId} onValueChange={setDesignerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select designer" />
              </SelectTrigger>
              <SelectContent>
                {designers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Brief Type</Label>
            <Select
              value={briefType}
              onValueChange={(v) => setBriefType(v as BriefType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BriefType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as BriefPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BriefPriority).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Deliverables</Label>
            <Textarea
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="Expected outputs (e.g. 3 fabric swatches, tech pack review notes)"
              rows={3}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={createTask.isPending || !projectId || !designerId}
            >
              Assign Brief
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/designers">View Designers</Link>
            </Button>
          </div>
        </form>
      </SectionCard>
    </AppPage>
  );
}
