import { Router } from 'express';
import { handleGetUsers } from '../controllers/user.controller.js';
const router = Router();
router.get('/', handleGetUsers);
export default router;
//# sourceMappingURL=user.routes.js.map