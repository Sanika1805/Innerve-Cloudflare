import { OpenAI } from 'openai';
import config from '../../../config/config';

export class TranscriptionWorker {
  constructor() {
    this.openai = new OpenAI(config.ai.openai.apiKey);
  }

  async transcribe(audioStream) {
    try {
      // Convert audio stream to chunks
      const audioChunks = await this.processAudioStream(audioStream);
      let fullTranscript = '';

      for (const chunk of audioChunks) {
        const response = await this.openai.audio.transcriptions.create({
          file: chunk,
          model: 'whisper-1',
          language: 'en',
          response_format: 'text'
        });

        fullTranscript += response.text + ' ';
      }

      return {
        text: fullTranscript.trim(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  async processAudioStream(stream) {
    try {
      const CHUNK_SIZE = 25 * 1024 * 1024; // 25MB chunks
      const chunks = [];
      
      let buffer = [];
      let currentSize = 0;
      
      for await (const chunk of stream) {
        buffer.push(chunk);
        currentSize += chunk.length;
        
        if (currentSize >= CHUNK_SIZE) {
          chunks.push(Buffer.concat(buffer));
          buffer = [];
          currentSize = 0;
        }
      }
      
      // Push remaining data
      if (buffer.length > 0) {
        chunks.push(Buffer.concat(buffer));
      }
      
      return chunks;
    } catch (error) {
      throw new Error(`Failed to process audio stream: ${error.message}`);
    }
  }
} 