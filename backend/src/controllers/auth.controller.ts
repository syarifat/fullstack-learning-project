import { Request, Response } from 'express';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['CLIENT', 'CONSULTANT'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await registerUser(email, password, role, name);

    res.status(201).json({
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        profile: result.user.profile
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const result = await loginUser(email, password);

    res.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        profile: result.user.profile
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const result = await refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: error.message || 'Token refresh failed' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await logoutUser(req.user.userId);
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const prisma = await import('../config/database').then(m => m.default);
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile
    });
  } catch (error: any) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
