'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateAdminUser } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserRole } from '@repo/types';
import type { WaitlistEntry } from '@repo/types';

interface ConvertDialogProps {
  entry: WaitlistEntry | null;
  onClose: () => void;
}

export function ConvertDialog({ entry, onClose }: ConvertDialogProps) {
  const createUser = useCreateAdminUser();
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry || !password.trim()) return;
    createUser.mutate(
      {
        email: entry.email,
        name: entry.name,
        password: password.trim(),
        role: UserRole.CUSTOMER,
      },
      {
        onSuccess: () => {
          toast.success(`${entry.name} converted to customer`);
          setPassword('');
          onClose();
        },
        onError: () => toast.error('Could not create customer account'),
      },
    );
  };

  return (
    <Dialog open={entry !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            Convert to customer
          </DialogTitle>
        </DialogHeader>
        {entry && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Account
              </span>
              <p className="text-sm font-medium text-foreground">{entry.name}</p>
              <p className="text-xs text-muted-foreground">{entry.email}</p>
              <p className="text-xs text-muted-foreground">{entry.brand}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Temporary password
              </label>
              <Input
                type="password"
                placeholder="Set a temporary password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                minLength={8}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                className="flex-1"
                disabled={createUser.isPending || !password.trim()}
              >
                {createUser.isPending ? 'Creating…' : 'Create customer account'}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
