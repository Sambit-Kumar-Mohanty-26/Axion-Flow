import { Router } from 'express';
import { handleVerifyEmployee, handleCompleteActivation } from '../controllers/activation.controller.js';
const router = Router();
router.post('/verify-employee', handleVerifyEmployee);
router.post('/complete', handleCompleteActivation);
export default router;
//# sourceMappingURL=activation.routes.js.map