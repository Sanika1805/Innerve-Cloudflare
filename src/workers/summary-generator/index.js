import { OpenAI } from 'openai';
import config from '../../../config/config';

export class SummaryGenerator {
  constructor() {
    this.openai = new OpenAI(config.ai.openai.apiKey);
  }

  async generateSummary(transcript) {
    try {
      const response = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI meeting assistant. Create a concise summary of the meeting transcript, highlighting key points, action items, and decisions made.'
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return {
        summary: response.choices[0].message.content,
        actionItems: this.extractActionItems(response.choices[0].message.content)
      };
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  extractActionItems(summary) {
    // Extract action items using regex or AI
    const actionItems = [];
    // Implementation here
    return actionItems;
  }
} 