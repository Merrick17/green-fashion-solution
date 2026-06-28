import { redirect } from 'next/navigation';
export default function AdminMeetingsRedirect() {
  redirect('/admin/calendar');
}
