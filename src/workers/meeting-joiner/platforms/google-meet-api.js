import { google } from 'googleapis';

export class GoogleMeetAPI {
  constructor(config) {
    this.config = config;
    this.auth = null;
  }

  async initialize() {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.auth.setCredentials({
      access_token: this.config.accessToken,
      refresh_token: this.config.refreshToken
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  async joinMeeting(meetingDetails) {
    try {
      await this.initialize();

      // Get meeting details from Calendar API
      const meeting = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: meetingDetails.eventId
      });

      // Extract meeting credentials
      const conferenceData = meeting.data.conferenceData;
      
      return {
        credentials: {
          meetingUrl: conferenceData.entryPoints[0].uri,
          passcode: conferenceData.conferenceId,
          accessToken: this.auth.credentials.access_token
        }
      };
    } catch (error) {
      throw new Error(`Failed to join Google Meet: ${error.message}`);
    }
  }
} 