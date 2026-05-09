import express, { Router, type Request, type Response } from 'express';
import { users, generateId } from '../models/index.js';

const router = Router();

// Register
router.post('/register', (req: Request, res: Response) => {
  try {
    const { phone, password, name, role, parentId, grade } = req.body;
    
    if (!phone || !password || !name) {
      return res.status(400).json({ error: 'Phone, password, and name are required' });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.phone === phone);
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    const newUser = {
      id: generateId(),
      phone,
      password, // In production, hash the password
      name,
      role: role || 'parent',
      parentId,
      grade,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Return user without password
    const { password: _, ...userResponse } = newUser;
    res.status(201).json({ 
      message: 'Registration successful',
      user: userResponse,
      token: newUser.id // Simple token for MVP
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }
    
    const user = users.find(u => u.phone === phone && u.password === password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }
    
    // Get associated students if parent
    let children: any[] = [];
    if (user.role === 'parent') {
      children = users
        .filter(u => u.parentId === user.id)
        .map(({ password: _, ...rest }) => rest);
    }
    
    const { password: _, ...userResponse } = user;
    res.json({ 
      message: 'Login successful',
      user: userResponse,
      token: user.id,
      children
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = users.find(u => u.id === token);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const { password: _, ...userResponse } = user;
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update profile
router.put('/profile', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const userIndex = users.findIndex(u => u.id === token);
    
    if (userIndex === -1) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const { name, avatar, grade } = req.body;
    
    if (name) users[userIndex].name = name;
    if (avatar) users[userIndex].avatar = avatar;
    if (grade) users[userIndex].grade = grade;
    users[userIndex].updatedAt = new Date().toISOString();
    
    const { password: _, ...userResponse } = users[userIndex];
    res.json({ message: 'Profile updated', user: userResponse });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add student to parent account
router.post('/students', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const parent = users.find(u => u.id === token && u.role === 'parent');
    
    if (!parent) {
      return res.status(403).json({ error: 'Only parents can add students' });
    }
    
    const { name, grade } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Student name is required' });
    }
    
    const newStudent = {
      id: generateId(),
      phone: '', // Students may not have phone
      password: '',
      name,
      role: 'student' as const,
      parentId: parent.id,
      grade,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newStudent);
    
    const { password: _, ...studentResponse } = newStudent;
    res.status(201).json({ message: 'Student added', student: studentResponse });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

export default router;
