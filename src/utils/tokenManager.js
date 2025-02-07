import { GoogleAuthHandler } from '../api/auth/googleAuth';

export class TokenManager {
  constructor(env) {
    this.env = env;
    this.authHandler = new GoogleAuthHandler();
  }

  async getValidAccessToken() {
    try {
      // Get tokens from KV
      const tokensStr = await this.env.KV.get('google_tokens');
      if (!tokensStr) {
        throw new Error('No tokens found');
      }

      const tokens = JSON.parse(tokensStr);
      const now = Date.now();

      // Check if current token is expired or will expire soon
      if (!tokens.expiry_date || tokens.expiry_date <= now + 60000) {
        // Token is expired or will expire soon, refresh it
        const newTokens = await this.authHandler.refreshAccessToken(tokens.refresh_token);
        
        // Update stored tokens
        await this.env.KV.put('google_tokens', JSON.stringify({
          ...tokens,
          access_token: newTokens.access_token,
          expiry_date: newTokens.expiry_date
        }));

        return newTokens.access_token;
      }

      return tokens.access_token;
    } catch (error) {
      console.error('Token management error:', error);
      throw new Error('Authentication required');
    }
  }
} 