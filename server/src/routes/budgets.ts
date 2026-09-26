import { Router } from 'express';
import { 
  createBudget, 
  getBudgets, 
  updateBudget, 
  deleteBudget 
} from '../controllers/budgetController';
import { validate } from '../middleware/validate';
import { budgetSchema } from '../validators/budget';
import { requireAuth } from '../middleware/auth';

const router = Router();

const updateBudgetSchema = budgetSchema.partial();

router.use(requireAuth);

router.post('/', validate(budgetSchema), createBudget);
router.get('/', getBudgets);
router.patch('/:id', validate(updateBudgetSchema), updateBudget);
router.delete('/:id', deleteBudget);

export default router;
