import { google } from 'googleapis';

export class GoogleAuthHandler {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });
  }

  async handleCallback(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      
      return {
        tokens,
        profile: userInfo.data
      };
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokens = await response.json();
      return {
        access_token: tokens.access_token,
        expiry_date: Date.now() + (tokens.expires_in * 1000)
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  async getUserInfo(accessToken) {
    try {
      // Get basic profile info
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await profileResponse.json();

      // Get calendar info
      const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const calendarData = await calendarResponse.json();

      // Return complete profile data
      return {
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        givenName: profile.given_name,
        familyName: profile.family_name,
        picture: profile.picture,
        locale: profile.locale,
        verified_email: profile.email_verified,
        calendars: calendarData.items?.map(cal => ({
          id: cal.id,
          name: cal.summary,
          primary: cal.primary || false
        })) || [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }
} 