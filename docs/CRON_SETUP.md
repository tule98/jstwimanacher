# Vercel Cron Configuration for Daily Todos Scheduler

## Overview

The todos module includes a daily scheduler that sends Slack notifications with today's scheduled tasks every morning at **06:00 GMT+7 (Asia/Ho_Chi_Minh timezone)**.

## How It Works

### Cron Schedule

- **Schedule**: `0 23 * * *` (UTC time)
- **Frequency**: Every day at 23:00 UTC
- **Converts to**: 06:00 GMT+7 the next day

### Configuration Files

#### 1. `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/scheduler/daily",
      "schedule": "0 23 * * *"
    }
  ]
}
```

#### 2. `/api/scheduler/daily/route.ts`

- Triggered by Vercel Cron at 23:00 UTC daily
- Queries today's todos in GMT+7 timezone
- Sends formatted Slack message with task list
- Returns JSON response with execution details

## Environment Variables Required

For the cron to work, ensure these are set in your Vercel environment:

### Required

- `SLACK_BOT_TOKEN` - Slack bot authentication token
- `SLACK_CHANNEL_ID` - Target Slack channel ID
- `CRON_SECRET` - Secret token to verify cron requests from Vercel
- `TURSO_DATABASE_URL` - Database connection
- `TURSO_AUTH_TOKEN` - Database authentication

### Optional

- `GEMINI_API_KEY` - For AI features (if enabled)

## Setting Up Cron on Vercel

### Step 1: Add CRON_SECRET to Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add a new variable:
   - Name: `CRON_SECRET`
   - Value: `your-secret-token-here` (generate a strong token)
   - Add to: Production, Preview, Development

### Step 2: Verify Configuration

1. Ensure `vercel.json` has the cron configuration
2. Deploy to Vercel: `git push`
3. Check Vercel deployment logs to confirm the cron is registered

### Step 3: Test the Cron

You can manually test the endpoint:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/scheduler/daily
```

Expected response:

```json
{
  "success": true,
  "sent": true,
  "count": 3,
  "timestamp": "2025-12-08T23:00:00.000Z"
}
```

## Slack Notification Format

The notification will look like:

```
🎯 *Today's Tasks (GMT+7)*:
• Buy groceries — 09:00
• Team meeting — 14:00
• Review documents — 16:30
```

Or if no tasks:

```
✅ No tasks scheduled for today.
```

## Troubleshooting

### Cron not triggering

- Check Vercel deployment logs: `vercel logs`
- Ensure `vercel.json` is in the root directory
- Verify the route file exists at `/api/scheduler/daily`
- Deploy again after making changes

### Slack notifications not sending

- Verify `SLACK_BOT_TOKEN` and `SLACK_CHANNEL_ID` are correctly set
- Check Slack bot has permission to post in the target channel
- Review application logs for error messages

### Timezone issues

- The cron uses GMT+7 (Asia/Ho_Chi_Minh) timezone for date calculations
- All todos in database are stored in UTC
- Time conversion happens at query time

## Notes

- Vercel Cron requires a **Pro plan or higher**
- Cron jobs have a **timeout limit of 10 seconds**
- The scheduler is production-only (won't run on preview deployments)
- Check Vercel docs for rate limits and pricing: https://vercel.com/docs/cron-jobs
