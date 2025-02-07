import OpenAI from 'openai';

export class AIService {
  constructor(env) {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
  }

  async generateMeetingSummary(transcript) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that helps summarize meetings and extract key points and action items."
          },
          {
            role: "user",
            content: `Please analyze this meeting transcript and provide: 
              1. A brief summary
              2. Key discussion points
              3. Action items with assignees
              4. Follow-up tasks
              
              Transcript: ${transcript}`
          }
        ],
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI Summary Error:', error);
      throw new Error('Failed to generate meeting summary');
    }
  }

  async suggestMeetingTime(participants, duration, preferences) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that helps schedule meetings optimally."
          },
          {
            role: "user",
            content: `Please suggest optimal meeting times considering:
              Participants: ${JSON.stringify(participants)}
              Duration: ${duration} minutes
              Preferences: ${JSON.stringify(preferences)}`
          }
        ],
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI Scheduling Error:', error);
      throw new Error('Failed to suggest meeting time');
    }
  }

  async generateAgenda(title, participants, context) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful meeting assistant that creates meeting agendas."
          },
          {
            role: "user",
            content: `Create a meeting agenda for "${title}" with ${participants.length} participants. Context: ${context}`
          }
        ]
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return "Failed to generate agenda";
    }
  }
} 