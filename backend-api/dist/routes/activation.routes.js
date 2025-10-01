// src/routes/activation.routes.ts
import { Router } from 'express';
import { handleVerifyEmployee, handleCompleteActivation } from '../controllers/activation.controller.js';
const router = Router();
// Route for the first step: Verifying the Employee ID
router.post('/verify-employee', handleVerifyEmployee);
// Route for the second step: Setting the password and finalizing the account
router.post('/complete', handleCompleteActivation);
export default router;
//# sourceMappingURL=activation.routes.js.map