import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationType, UserRole, WS_EVENTS } from '@repo/types';
import { emailTemplates } from '../email/email-templates';
import { BRAND } from '../config/brand';
import { DEFAULT_WEB_URL } from '../config/defaults';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly gateway: NotificationsGateway,
  ) {}

  private get webUrl(): string {
    return process.env.WEB_URL ?? DEFAULT_WEB_URL;
  }

  async notifyProposalReady(projectId: string, proposalId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { customer: true },
    });
    if (!project) return;
    const html = emailTemplates.proposalReady(
      project.customer.name,
      project.title,
      `${this.webUrl}/customer/proposals/${proposalId}`,
    );
    await this.dispatch(
      project.customerId,
      project.customer.email,
      project.customer.emailNotifications,
      NotificationType.PROPOSAL_READY,
      'A new proposal is ready for your review.',
      'New proposal ready',
      html,
    );
  }

  async notifyTaskAssigned(designerId: string, title: string) {
    const user = await this.prisma.user.findUnique({ where: { id: designerId } });
    if (!user) return;
    const html = emailTemplates.taskAssigned(
      user.name,
      title,
      'your project',
      `${this.webUrl}/designer/tasks`,
    );
    await this.dispatch(
      designerId,
      user.email,
      user.emailNotifications,
      NotificationType.TASK_ASSIGNED,
      `New task assigned: ${title}`,
      'New task assigned',
      html,
    );
  }

  // TODO: pass customerName from caller for a more personalised email
  async notifyMeetingRequested(adminIds: string[]) {
    for (const adminId of adminIds) {
      const user = await this.prisma.user.findUnique({ where: { id: adminId } });
      if (!user) continue;
      const html = emailTemplates.meetingRequested(
        user.name,
        'A customer',
        '',
        `${this.webUrl}/admin/meetings`,
      );
      await this.dispatch(
        adminId,
        user.email,
        user.emailNotifications,
        NotificationType.MEETING_REQUESTED,
        'A customer has requested a meeting.',
        'Meeting requested',
        html,
      );
    }
  }

  async notifyMeetingApproved(customerId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: customerId } });
    if (!user) return;
    const html = emailTemplates.meetingApproved(
      user.name,
      'your scheduled time',
      null,
      `${this.webUrl}/customer/calendar`,
    );
    await this.dispatch(
      customerId,
      user.email,
      user.emailNotifications,
      NotificationType.MEETING_APPROVED,
      'Your meeting request has been approved.',
      'Meeting approved',
      html,
    );
  }

  async notifyStatusChanged(userId: string, projectTitle: string, status: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    const html = emailTemplates.statusChanged(
      user.name,
      projectTitle,
      status,
      `${this.webUrl}/customer/projects`,
    );
    await this.dispatch(
      userId,
      user.email,
      user.emailNotifications,
      NotificationType.STATUS_CHANGED,
      `Project "${projectTitle}" status updated to ${status}.`,
      'Project status updated',
      html,
    );
  }

  async notifyBriefSubmitted(adminIds: string[], projectTitle: string) {
    for (const adminId of adminIds) {
      const user = await this.prisma.user.findUnique({ where: { id: adminId } });
      if (!user) continue;
      const html = emailTemplates.statusChanged(
        user.name,
        projectTitle,
        'BRIEF_SUBMITTED',
        `${this.webUrl}/admin/projects`,
      );
      await this.dispatch(
        adminId,
        user.email,
        user.emailNotifications,
        NotificationType.STATUS_CHANGED,
        `Customer submitted project brief: "${projectTitle}".`,
        'Project brief submitted',
        html,
      );
    }
  }

  private async dispatch(
    userId: string,
    email: string,
    emailEnabled: boolean,
    type: NotificationType,
    message: string,
    emailSubject: string,
    htmlBody: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type: type as any, message },
    });

    this.gateway.emitToUser(userId, WS_EVENTS.NOTIFICATION, notification);

    if (emailEnabled) {
      await this.email.send(email, `${BRAND.EMAIL_SUBJECT_PREFIX}${emailSubject}`, htmlBody);
    }
  }

  async getAdminIds(): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true },
    });
    return admins.map((a) => a.id);
  }

  // Phase 4 (additive, non-breaking): realtime cache-invalidation emits.
  // These fan out to the relevant customer + all admins so each portal's React
  // Query caches refresh. The gateway already exposes the underlying emit methods
  // (emitProposalUpdate / emitMeetingUpdate / emitProjectStatus); these are thin,
  // DRY wrappers. No existing flow is changed.
  async emitProposalUpdated(customerId: string, proposal: unknown) {
    await this.broadcast('emitProposalUpdate', customerId, proposal);
  }

  async emitMeetingUpdated(customerId: string, meeting: unknown) {
    await this.broadcast('emitMeetingUpdate', customerId, meeting);
  }

  async emitProjectStatusChanged(customerId: string, project: unknown) {
    await this.broadcast('emitProjectStatus', customerId, project);
  }

  private async broadcast(
    method: 'emitProposalUpdate' | 'emitMeetingUpdate' | 'emitProjectStatus',
    customerId: string,
    payload: unknown,
  ) {
    this.gateway[method](customerId, payload);
    const adminIds = await this.getAdminIds();
    for (const id of adminIds) this.gateway[method](id, payload);
  }
}
