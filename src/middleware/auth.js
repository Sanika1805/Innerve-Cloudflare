import { verify } from 'jsonwebtoken';

export async function authMiddleware(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token, env.JWT_SECRET);
    
    // Add user info to request
    request.user = decoded;
    return null; // Continue to next middleware/handler
  } catch (error) {
    return new Response('Invalid token', { status: 403 });
  }
}

async function verifyToken(token, secret) {
  try {
    const decoded = await verify(token, secret);
    return {
      userId: decoded.userId,
      email: decoded.email,
      permissions: decoded.permissions
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
} 