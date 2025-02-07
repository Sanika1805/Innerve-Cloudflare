export class CacheService {
  constructor(env) {
    this.kv = env.KV;
  }

  async getMeetingSummary(meetingId) {
    return await this.kv.get(`summary:${meetingId}`);
  }

  async cacheMeetingSummary(meetingId, summary, expirationTtl = 86400) {
    await this.kv.put(
      `summary:${meetingId}`,
      JSON.stringify(summary),
      { expirationTtl } // 24 hours default
    );
  }
} 