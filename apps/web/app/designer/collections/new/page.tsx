'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { useCreateCollection } from '@/hooks/use-collections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
export default function NewCollectionPage() {
  const router = useRouter();
  const create = useCreateCollection();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      { name, description: description || undefined },
      { onSuccess: (c) => router.push(`/designer/collections/${c.id}`) },
    );
  };
  return (
    <AppPage width="narrow">
      <Breadcrumb
        items={[
          { label: 'Collections', href: '/designer/collections' },
          { label: 'New' },
        ]}
      />
      <PageHeader
        title="New collection"
        description="Create a curated asset group"
      />
      <form onSubmit={handleSubmit}>
        <SectionCard title="Details">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit" disabled={!name || create.isPending}>
              Create collection
            </Button>
          </div>
        </SectionCard>
      </form>
    </AppPage>
  );
}
