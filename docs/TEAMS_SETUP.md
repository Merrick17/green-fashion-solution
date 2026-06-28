# Microsoft Teams Integration

## Azure app registration

1. Register app in Azure Portal → App registrations
2. Add application permission: `OnlineMeetings.ReadWrite`, `Calendars.ReadWrite`
3. Grant admin consent
4. Create client secret

## Environment variables

```
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_USER_EMAIL=organizer@yourdomain.com
```

## Flow

Customer requests meeting → Admin schedules on Meetings page → Graph API creates online meeting → `teamsLink` stored → both parties notified.

If Graph is not configured, admin UI shows a configuration banner; meetings still save without a Teams link.
