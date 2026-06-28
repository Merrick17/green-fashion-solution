'use client';
import { useState } from 'react';
import { BriefOptionType, type BriefOption } from '@repo/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AdminEntityRow } from '@/components/admin/admin-entity-row';
import {
  useCreateBriefOption,
  useDeleteBriefOption,
  useUpdateBriefOption,
} from '@/hooks/use-brief-options';
interface BriefOptionsPanelProps {
  type: BriefOptionType;
  title: string;
  description: string;
  options: BriefOption[];
}
export function BriefOptionsPanel({
  type,
  title,
  description,
  options,
}: BriefOptionsPanelProps) {
  const [label, setLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const createOption = useCreateBriefOption();
  const updateOption = useUpdateBriefOption();
  const deleteOption = useDeleteBriefOption();
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    createOption.mutate(
      { type, label: trimmed },
      { onSuccess: () => setLabel('') },
    );
  };
  const startEdit = (option: BriefOption) => {
    setEditingId(option.id);
    setEditLabel(option.label);
  };
  const saveEdit = (id: string) => {
    const trimmed = editLabel.trim();
    if (!trimmed) return;
    updateOption.mutate(
      { id, dto: { label: trimmed } },
      { onSuccess: () => setEditingId(null) },
    );
  };
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-xl tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={`Add ${title.toLowerCase().slice(0, -1)}…`}
          aria-label={`New ${title.toLowerCase()} label`}
        />
        <Button
          type="submit"
          disabled={!label.trim() || createOption.isPending}
        >
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.id} className="space-y-2">
            {editingId === option.id ? (
              <div className="flex gap-2">
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  aria-label="Edit label"
                />
                <Button size="sm" onClick={() => saveEdit(option.id)}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <AdminEntityRow
                title={option.label}
                subtitle={`Order ${option.sortOrder}`}
                actions={
                  <>
                    {!option.active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Active
                      </span>
                      <Switch
                        checked={option.active}
                        onCheckedChange={(active) =>
                          updateOption.mutate({
                            id: option.id,
                            dto: { active },
                          })
                        }
                        aria-label={`Toggle ${option.label}`}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(option)}
                    >
                      Edit
                    </Button>
                  </>
                }
                onDelete={() => deleteOption.mutate(option.id)}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
