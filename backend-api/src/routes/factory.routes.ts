import { Router } from 'express';
import { handleCreateFactory, handleGetFactories, handleUpdateLayout, handleGetLayout  } from '../controllers/factory.controller.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authorize('ORG_ADMIN'), handleGetFactories);
router.post('/', authorize('ORG_ADMIN'), handleCreateFactory);

router.get('/layout', handleGetLayout);
router.put('/layout', handleUpdateLayout);

export default router;