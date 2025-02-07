import { Router } from 'itty-router';
import { GoogleAuthHandler } from './googleAuth';

const router = Router();
const authHandler = new GoogleAuthHandler();

// Add a test route to verify auth routing works
router.get('/auth/test', () => {
  return new Response('Auth routes working!', {
    headers: { 'Content-Type': 'text/plain' }
  });
});

router.get('/auth/google', () => {
  try {
    const authUrl = authHandler.getAuthUrl();
    return Response.redirect(authUrl);
  } catch (error) {
    return new Response(`Auth Error: ${error.message}`, { status: 500 });
  }
});

router.get('/auth/google/callback', async (request, env) => {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return new Response('No authorization code provided', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const tokens = await authHandler.handleCallback(code);
    
    if (env?.KV) {
      await env.KV.put('google_tokens', JSON.stringify({
        ...tokens,
        lastUpdated: new Date().toISOString()
      }));
    }

    return new Response('Authentication successful!', {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    return new Response(`Authentication failed: ${error.message}`, {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
});

export default router; 