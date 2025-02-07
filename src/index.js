import { Router } from 'itty-router';

const router = Router();

// Basic home route
router.get('/', () => {
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AI Assistant</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background: #4285f4;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to AI Assistant</h1>
          <p>Your intelligent meeting management solution</p>
          <a href="/auth/google" class="button">Login with Google</a>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
});

// Simple test route
router.get('/test', () => {
  return new Response('Test route working!', {
    headers: { 'Content-Type': 'text/plain' }
  });
});

// Handle 404s
router.all('*', () => new Response('Not Found', { status: 404 }));

// Export the worker
export default {
  fetch: router.handle
}; 