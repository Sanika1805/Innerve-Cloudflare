export class RetryableError extends Error {
  constructor(message, retryAfter = 1000) {
    super(message);
    this.retryAfter = retryAfter;
  }
}

export async function withRetry(operation, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (!(error instanceof RetryableError)) {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw new Error(`Operation failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
} 