'use client';
import Link from 'next/link';
import { WorkspaceHeader } from '@/components/design-system/workspace-header';
import { SchedulingExperience } from '@/components/calendar/scheduling-experience';
import { useUpdateMeeting } from '@/hooks/use-meetings';
import { Button } from '@/components/ui/button';
import { MeetingStatus } from '@repo/types';
interface PortalCalendarPageProps {
  title: string;
  description: string;
  requestMeetingHref?: string;
  showMilestones?: boolean;
  showTasks?: boolean;
  adminActions?: boolean;
}
export function PortalCalendarPage({
  title,
  description,
  requestMeetingHref,
  showMilestones = false,
  showTasks = false,
  adminActions = false,
}: PortalCalendarPageProps) {
  const updateMeeting = useUpdateMeeting();
  const approveMeeting = (id: string) => {
    const scheduledAt = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString();
    updateMeeting.mutate({
      id,
      dto: { status: MeetingStatus.SCHEDULED, scheduledAt },
    });
  };
  return (
    <div className="flex w-full min-h-0 flex-1 flex-col gap-8 flex min-h-0 flex-1 flex-col gap-6">
      <WorkspaceHeader
        title={title}
        phase={description}
        actions={
          requestMeetingHref ? (
            <Button asChild variant="brand" size="sm">
              <Link href={requestMeetingHref}>Schedule review</Link>
            </Button>
          ) : undefined
        }
      />
      <SchedulingExperience
        showMilestones={showMilestones}
        showTasks={showTasks}
        adminActions={adminActions}
        onApproveMeeting={approveMeeting}
        isApproving={updateMeeting.isPending}
      />
    </div>
  );
}
