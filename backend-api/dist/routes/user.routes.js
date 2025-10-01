import { Router } from 'express';
import { handleGetUsers } from '../controllers/user.controller.js';
const router = Router();
// Defines the route for GET /api/users
// It will retrieve a list of all users in the admin's organization.
router.get('/', handleGetUsers);
export default router;
//# sourceMappingURL=user.routes.js.map