import { Router } from 'itty-router';
import { handleZoomMeeting } from './platforms/zoom';
import { handleGoogleMeet } from './platforms/meet';
import { handleTeamsMeeting } from './platforms/teams';

const router = Router();

export class MeetingJoiner {
  constructor(platform, meetingDetails) {
    this.platform = platform;
    this.meetingDetails = meetingDetails;
  }

  async join() {
    switch(this.platform) {
      case 'zoom':
        return await handleZoomMeeting(this.meetingDetails);
      case 'meet':
        return await handleGoogleMeet(this.meetingDetails);
      case 'teams':
        return await handleTeamsMeeting(this.meetingDetails);
      default:
        throw new Error('Unsupported platform');
    }
  }
}

router.post('/join', async (request) => {
  try {
    const { platform, meetingDetails } = await request.json();
    const joiner = new MeetingJoiner(platform, meetingDetails);
    const result = await joiner.join();
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

export default {
  fetch: router.handle
}; 