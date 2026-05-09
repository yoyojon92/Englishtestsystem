import { users } from '../models/index.js';

interface AuthRequest extends Record<string, any> {
  userId?: string;
  userRole?: string;
  headers: Record<string, any>;
  params: Record<string, any>;
  query: Record<string, any>;
  body: Record<string, any>;
}

export type { AuthRequest };

// Verify token and attach user info to request
export function verifyToken(req: AuthRequest, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Find user by simple token lookup (use userId as token for MVP)
  const user = users.find(u => u.id === token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
  
  req.userId = user.id;
  req.userRole = user.role;
  next();
}

// Simple token auth (in production, use JWT)
export function authMiddleware(req: AuthRequest, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Find user by simple token lookup (use userId as token for MVP)
  const user = users.find(u => u.id === token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
  
  req.userId = user.id;
  req.userRole = user.role;
  next();
}

// Optional auth middleware - doesn't fail if no token
export function optionalAuth(req: AuthRequest, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = users.find(u => u.id === token);
    
    if (user) {
      req.userId = user.id;
      req.userRole = user.role;
    }
  }
  
  next();
}
