export class MonitoringService {
  constructor() {
    this.metrics = {};
  }

  trackMetric(name, value, tags = {}) {
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    
    this.metrics[name].push({
      value,
      timestamp: new Date(),
      tags
    });
  }

  async logEvent(eventName, data) {
    await fetch('https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: eventName,
        data,
        timestamp: new Date().toISOString()
      })
    });
  }
} 