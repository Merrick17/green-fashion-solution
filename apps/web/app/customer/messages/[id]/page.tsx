'use client';
import { use } from 'react';
import { AppPage } from '@/components/layout';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { MessageThreadView } from '@/components/shared/message-thread-view';
import { useMessageThread } from '@/hooks/use-messages';
import { UserRole } from '@repo/types';
export default function CustomerMessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: thread, isLoading } = useMessageThread(id);
  if (isLoading) return <RouteSkeleton variant="detail" />;
  if (!thread) return <AppPage><p>Thread not found</p></AppPage>;
  const messages = thread.messages ?? [];
  return (
    <AppPage>
      <Breadcrumb
        items={[
          { label: 'Messages', href: '/customer/messages' },
          {
            label: thread.projectId
              ? `Project ${thread.projectId.slice(0, 8)}`
              : 'Conversation',
          },
        ]}
      />
      <PageHeader
        title="Conversation"
        description="Messages with your sourcing team — designers are not in this channel"
      />
      <MessageThreadView
        threadId={id}
        messages={messages}
        viewerRole={UserRole.CUSTOMER}
      />
    </AppPage>
  );
}
