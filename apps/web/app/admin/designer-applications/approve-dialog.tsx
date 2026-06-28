'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useApproveDesignerApplication } from '@/hooks/use-admin';
interface ApproveDialogProps {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
}
export function ApproveDialog({
  applicationId,
  applicantName,
  applicantEmail,
}: ApproveDialogProps) {
  const approve = useApproveDesignerApplication();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const handleApprove = () => {
    if (!password || password.length < 8) return;
    approve.mutate(
      { id: applicationId, dto: { password } },
      {
        onSuccess: () => {
          setOpen(false);
          setPassword('');
        },
      },
    );
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setPassword('');
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Approve</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create account for {applicantName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <p className="text-sm text-muted-foreground">
            Set an initial password for {applicantEmail}. Share it securely with
            the designer.
          </p>
          <div className="space-y-2">
            <Label>Temporary password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
            />
          </div>
          <Button
            onClick={handleApprove}
            disabled={approve.isPending || password.length < 8}
          >
            Create designer account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
