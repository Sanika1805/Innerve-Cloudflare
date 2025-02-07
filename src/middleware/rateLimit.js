export async function rateLimitMiddleware(request, env) {
  try {
    // Skip rate limiting in development
    if (env?.ENVIRONMENT === 'development') {
      return null;
    }

    if (!env?.KV) {
      // Only warn in production
      if (env?.ENVIRONMENT === 'production') {
        console.warn('KV binding not available in production');
      }
      return null;
    }

    const ip = request.headers.get('CF-Connecting-IP') || 
               request.headers.get('X-Real-IP') || 
               'unknown';
    
    const key = `ratelimit:${ip}`;
    
    try {
      const currentRequests = parseInt(await env.KV.get(key) || '0');
      
      if (currentRequests >= 100) {
        return new Response('Too Many Requests', { 
          status: 429,
          headers: {
            'Content-Type': 'text/plain',
            'Retry-After': '60'
          }
        });
      }
      
      await env.KV.put(key, (currentRequests + 1).toString(), { 
        expirationTtl: 60 
      });
    } catch (kvError) {
      console.error('KV operation failed:', kvError);
    }

    return null;
  } catch (error) {
    console.error('Rate limit error:', error);
    return null;
  }
} 