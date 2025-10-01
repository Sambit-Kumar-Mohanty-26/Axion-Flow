// src/routes/auth.routes.ts
import { Router } from 'express';
import { handleRegister, handleLogin, handleCheckStatus, handleWorkerLogin } from '../controllers/auth.controller.js';
const router = Router();
router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.get('/status/:email', handleCheckStatus);
router.post('/login/worker', handleWorkerLogin);
export default router;
//# sourceMappingURL=auth.routes.js.map