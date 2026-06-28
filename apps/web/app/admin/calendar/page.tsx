import { PortalCalendarPage } from '@/components/shared/portal-calendar-page';
export default function AdminCalendarPage() {
  return (
    <PortalCalendarPage
      title="Calendar"
      description="Meetings, milestones, and production deadlines"
      showMilestones
      adminActions
    />
  );
}
