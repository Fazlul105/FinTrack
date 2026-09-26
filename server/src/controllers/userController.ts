import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body as { name?: string };

    if (!name || name.trim().length < 2) {
      res.status(400).json({ error: 'Name must be at least 2 characters long' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};
