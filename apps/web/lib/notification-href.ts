import { NotificationType, type Notification } from "@repo/types";

export function notificationHref(notification: Notification): string {
  switch (notification.type) {
    case NotificationType.PROPOSAL_READY:
      return "/customer/proposals";
    case NotificationType.MEETING_APPROVED:
    case NotificationType.MEETING_REQUESTED:
      return "/customer/calendar";
    case NotificationType.STATUS_CHANGED:
      return "/customer/projects";
    case NotificationType.MESSAGE_RECEIVED:
      return "/customer/dashboard";
    default:
      return "/customer/dashboard";
  }
}

export function notificationTypeLabel(type: NotificationType): string {
  return type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
