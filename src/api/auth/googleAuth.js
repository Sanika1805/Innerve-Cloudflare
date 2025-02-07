export class GoogleAuthHandler {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI;
  }

  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',  // Full calendar access
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleCallback(code) {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get access token');
      }

      const tokens = await tokenResponse.json();
      
      // Store tokens in KV
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: Date.now() + (tokens.expires_in * 1000)
      };
    } catch (error) {
      console.error('Token exchange error:', error);
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