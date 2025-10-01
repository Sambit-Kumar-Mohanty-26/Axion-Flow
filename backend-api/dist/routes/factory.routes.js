// src/routes/factory.routes.ts
import { Router } from 'express';
import { handleCreateFactory, handleGetFactories } from '../controllers/factory.controller.js';
const router = Router();
router.get('/', handleGetFactories);
router.post('/', handleCreateFactory);
export default router;
//# sourceMappingURL=factory.routes.js.map