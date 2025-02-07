import { MeetingJoiner } from '../../workers/meeting-joiner';
import { SummaryGenerator } from '../../workers/summary-generator';
import { TaskSynchronizer } from '../integrations/taskSync';

export class MeetingHandler {
  constructor(platform, meetingDetails, integrations) {
    this.platform = platform;
    this.meetingDetails = meetingDetails;
    this.integrations = integrations;
  }

  async handleMeeting() {
    try {
      // 1. Join the meeting
      const joiner = new MeetingJoiner(this.platform, this.meetingDetails);
      const meetingSession = await joiner.join();

      // 2. Record and transcribe the meeting
      const transcript = await meetingSession.recordAndTranscribe();

      // 3. Generate summary
      const summaryGenerator = new SummaryGenerator();
      const { summary, actionItems } = await summaryGenerator.generateSummary(transcript);

      // 4. Sync with productivity tools
      for (const integration of this.integrations) {
        const synchronizer = new TaskSynchronizer(integration.platform, integration.credentials);
        await synchronizer.syncTasks(actionItems);
      }

      return {
        success: true,
        summary,
        actionItems,
        meetingId: meetingSession.id
      };
    } catch (error) {
      throw new Error(`Failed to handle meeting: ${error.message}`);
    }
  }
} 