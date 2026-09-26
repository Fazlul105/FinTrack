import { Router } from 'express';
import { 
  createTransaction, 
  getTransactions, 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction 
} from '../controllers/transactionController';
import { validate } from '../middleware/validate';
import { transactionSchema } from '../validators/transaction';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Wrap transaction updates in a partial schema for PATCH
const updateTransactionSchema = transactionSchema.partial();

router.use(requireAuth);

router.post('/', validate(transactionSchema), createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.patch('/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
