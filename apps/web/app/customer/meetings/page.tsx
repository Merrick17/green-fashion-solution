import { redirect } from 'next/navigation';
export default function CustomerMeetingsRedirect() {
  redirect('/customer/calendar');
}
