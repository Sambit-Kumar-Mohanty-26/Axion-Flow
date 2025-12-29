import { Router } from 'express';
import { handleCreateFactory, handleGetFactories, handleUpdateLayout, handleGetLayout  } from '../controllers/factory.controller.js';

const router = Router();

router.get('/', handleGetFactories);
router.post('/', handleCreateFactory);

router.get('/layout', handleGetLayout);
router.put('/layout', handleUpdateLayout);

export default router;