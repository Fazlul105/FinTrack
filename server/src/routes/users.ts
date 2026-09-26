import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

export default router;
