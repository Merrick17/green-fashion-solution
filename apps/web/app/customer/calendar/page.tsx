import { PortalCalendarPage } from '@/components/shared/portal-calendar-page';
export default function CustomerCalendarPage() {
  return (
    <PortalCalendarPage
      title="Calendar"
      description="Your meetings, milestones, and consultations with our sourcing team"
      requestMeetingHref="/customer/meetings/request"
      showMilestones
    />
  );
}
