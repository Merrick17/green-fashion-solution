import { BRAND } from '../config/brand';

export const emailTemplates = {
  proposalReady: (customerName: string, projectTitle: string, proposalUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Proposal Ready</title></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:ui-sans-serif,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#faf8f5;border:1px solid #ddd8d0;border-radius:8px;padding:40px">
    <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671">${BRAND.NAME}</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#404040;font-weight:600">Your sourcing proposal is ready</h1>
    <p style="margin:0 0 8px;color:#787671;line-height:1.6">Hi ${customerName},</p>
    <p style="margin:0 0 28px;color:#787671;line-height:1.6">A new sourcing proposal has been prepared for <strong style="color:#404040">${projectTitle}</strong>. Log in to review the curated fabrics and product references, then approve, request changes, or reject.</p>
    <a href="${proposalUrl}" style="display:inline-block;background:#5f6f64;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">Review Proposal →</a>
    <hr style="border:none;border-top:1px solid #ddd8d0;margin:32px 0">
    <p style="margin:0;font-size:12px;color:#a8a49c">You received this because you have an active project with ${BRAND.NAME}. <a href="${proposalUrl.split('/customer')[0]}/customer/settings" style="color:#787671">Manage notifications</a></p>
  </div>
</body>
</html>`,

  taskAssigned: (designerName: string, taskTitle: string, projectTitle: string, dashboardUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>New Task</title></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:ui-sans-serif,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#faf8f5;border:1px solid #ddd8d0;border-radius:8px;padding:40px">
    <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671">${BRAND.NAME}${BRAND.INTERNAL_SUFFIX}</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#404040;font-weight:600">New sourcing task assigned</h1>
    <p style="margin:0 0 8px;color:#787671;line-height:1.6">Hi ${designerName},</p>
    <p style="margin:0 0 4px;color:#787671;line-height:1.6">You have been assigned a new task:</p>
    <p style="margin:0 0 4px;padding:12px 16px;background:#ebe7e1;border-radius:6px;color:#404040;font-weight:500">${taskTitle}</p>
    <p style="margin:0 0 28px;color:#787671;font-size:13px">Project: ${projectTitle}</p>
    <a href="${dashboardUrl}" style="display:inline-block;background:#5f6f64;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">View Task →</a>
  </div>
</body>
</html>`,

  meetingRequested: (adminName: string, customerName: string, proposedDate: string, adminUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Meeting Request</title></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:ui-sans-serif,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#faf8f5;border:1px solid #ddd8d0;border-radius:8px;padding:40px">
    <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671">${BRAND.NAME}${BRAND.INTERNAL_SUFFIX}</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#404040;font-weight:600">Meeting requested</h1>
    <p style="margin:0 0 8px;color:#787671;line-height:1.6">Hi ${adminName},</p>
    <p style="margin:0 0 28px;color:#787671;line-height:1.6"><strong style="color:#404040">${customerName}</strong> has requested a meeting${proposedDate ? ` on <strong style="color:#404040">${proposedDate}</strong>` : ''}. Log in to approve or reschedule.</p>
    <a href="${adminUrl}" style="display:inline-block;background:#5f6f64;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">Review Request →</a>
  </div>
</body>
</html>`,

  meetingApproved: (customerName: string, formattedDate: string, teamsLink: string | null | undefined, calendarUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Meeting Confirmed</title></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:ui-sans-serif,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#faf8f5;border:1px solid #ddd8d0;border-radius:8px;padding:40px">
    <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671">${BRAND.NAME}</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#404040;font-weight:600">Meeting confirmed</h1>
    <p style="margin:0 0 8px;color:#787671;line-height:1.6">Hi ${customerName},</p>
    <p style="margin:0 0 28px;color:#787671;line-height:1.6">Your meeting has been confirmed for <strong style="color:#404040">${formattedDate}</strong>.</p>
    ${teamsLink ? `<a href="${teamsLink}" style="display:inline-block;background:#5f6f64;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;margin-bottom:12px">Join Teams Meeting →</a><br>` : ''}
    <a href="${calendarUrl}" style="display:inline-block;border:1px solid #ddd8d0;color:#404040;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px">View Calendar</a>
  </div>
</body>
</html>`,

  statusChanged: (userName: string, projectTitle: string, newStatus: string, projectUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Project Update</title></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:ui-sans-serif,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#faf8f5;border:1px solid #ddd8d0;border-radius:8px;padding:40px">
    <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671">${BRAND.NAME}</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#404040;font-weight:600">Project status updated</h1>
    <p style="margin:0 0 8px;color:#787671;line-height:1.6">Hi ${userName},</p>
    <p style="margin:0 0 28px;color:#787671;line-height:1.6"><strong style="color:#404040">${projectTitle}</strong> has moved to <strong style="color:#404040">${newStatus.replace(/_/g, ' ')}</strong>.</p>
    <a href="${projectUrl}" style="display:inline-block;background:#5f6f64;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">View Project →</a>
  </div>
</body>
</html>`,

  passwordResetEmail: (name: string, resetUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset your GFS password</title></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:ui-sans-serif,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#faf8f5;border:1px solid #ddd8d0;border-radius:8px;padding:40px">
    <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671">${BRAND.NAME}</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#404040;font-weight:600">Reset your GFS password</h1>
    <p style="margin:0 0 8px;color:#787671;line-height:1.6">Hi ${name},</p>
    <p style="margin:0 0 28px;color:#787671;line-height:1.6">We received a request to reset your password. Click the button below to choose a new one.</p>
    <a href="${resetUrl}" style="display:inline-block;background:#5f6f64;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">Reset Password →</a>
    <p style="margin:24px 0 0;color:#a8a49c;font-size:13px;line-height:1.6">This link expires in 15 minutes.</p>
    <p style="margin:8px 0 0;color:#a8a49c;font-size:13px;line-height:1.6">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body>
</html>`,

  emailVerificationEmail: (name: string, verifyUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify your email address</title></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:ui-sans-serif,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#faf8f5;border:1px solid #ddd8d0;border-radius:8px;padding:40px">
    <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671">${BRAND.NAME}</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#404040;font-weight:600">Verify your email address</h1>
    <p style="margin:0 0 8px;color:#787671;line-height:1.6">Hi ${name},</p>
    <p style="margin:0 0 28px;color:#787671;line-height:1.6">Thanks for joining GFS. Please verify your email address to get started.</p>
    <a href="${verifyUrl}" style="display:inline-block;background:#5f6f64;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">Verify Email →</a>
    <p style="margin:24px 0 0;color:#a8a49c;font-size:13px;line-height:1.6">This link expires in 24 hours.</p>
  </div>
</body>
</html>`,

  changeRequestReceived: (adminName: string, customerName: string, projectTitle: string, proposalUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Change request from ${customerName}</title></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:ui-sans-serif,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#faf8f5;border:1px solid #ddd8d0;border-radius:8px;padding:40px">
    <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671">${BRAND.NAME}${BRAND.INTERNAL_SUFFIX}</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#404040;font-weight:600">Change request received</h1>
    <p style="margin:0 0 8px;color:#787671;line-height:1.6">Hi ${adminName},</p>
    <p style="margin:0 0 28px;color:#787671;line-height:1.6"><strong style="color:#404040">${customerName}</strong> has requested changes to the proposal for <strong style="color:#404040">${projectTitle}</strong>.</p>
    <a href="${proposalUrl}" style="display:inline-block;background:#5f6f64;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">Review Request →</a>
  </div>
</body>
</html>`,

  proposalApproved: (adminName: string, customerName: string, projectTitle: string): string => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Proposal approved by ${customerName}</title></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:ui-sans-serif,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#faf8f5;border:1px solid #ddd8d0;border-radius:8px;padding:40px">
    <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671">${BRAND.NAME}${BRAND.INTERNAL_SUFFIX}</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#404040;font-weight:600">Proposal approved</h1>
    <p style="margin:0 0 8px;color:#787671;line-height:1.6">Hi ${adminName},</p>
    <p style="margin:0 0 0;color:#787671;line-height:1.6"><strong style="color:#404040">${customerName}</strong> has approved the proposal for <strong style="color:#404040">${projectTitle}</strong>. You can now proceed to sampling.</p>
  </div>
</body>
</html>`,
};
