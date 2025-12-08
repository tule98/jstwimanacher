export class SlackNotificationService {
  constructor() {}

  async send(text: string) {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({ channel: process.env.SLACK_CHANNEL_ID, text }),
    });
    const data = await res.json();
    if (!data.ok) {
      throw new Error(`Slack error: ${data.error}`);
    }
    return data;
  }
}
