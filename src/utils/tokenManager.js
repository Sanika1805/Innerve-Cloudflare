import jwt from 'jsonwebtoken';

export class TokenManager {
  constructor(env) {
    this.env = env;
  }

  async getValidAccessToken() {
    try {
      const userData = await this.env.KV.get('user_data');
      if (!userData) {
        throw new Error('No user data found');
      }

      const { tokens } = JSON.parse(userData);
      return tokens.access_token;
    } catch (error) {
      console.error('Token Manager Error:', error);
      throw error;
    }
  }
} 